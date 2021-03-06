/*
 ==========================================================================
 epiCODAPConnector.js

 Critter view class for the med DSG.

 Author:   Tim Erickson

 Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ==========================================================================
 */
/**
 * Created by tim on 10/28/15.
 */

/**
 * A  manager class responsible for connecting to the CODAP environment
 * @constructor
 */
var EpiCODAPConnector = function(  ) {
    this.gameCaseID = 0;
    this.gameNumber = 0;
    this.gameCollectionName = null;
};

/**
 * Open a new "parent" case (the "game" level in the hierarchy)
 *
 * @param gameCollectionName
 * @param gameNumber
 */
EpiCODAPConnector.prototype.newGameCase = function(gameCollectionName, gameNumber ) {

    this.gameCollectionName = gameCollectionName;
    this.gameNumber = gameNumber;

    codapHelper.openCase(
        this.gameCollectionName,
        [this.gameNumber, null],
        function( iResult ) {
            this.gameCaseID = iResult.caseID;
        }.bind(this)
    );

};

/**
 * finishes the current game case
 */
EpiCODAPConnector.prototype.finishGameCase = function( iData ) {
    codapHelper.closeCase(
        this.gameCollectionName,
        [
            this.gameNumber,
            iData.nMoves,
            iData.sickSeconds,
            iData.elapsed,
            iData.result,
        ],
        this.gameCaseID
    );
    this.gameCaseID = 0;     //  so we know there is no open case
};

/**
 * Emit an "event" case, low level in the hierarchy.
 * @param values
 */
EpiCODAPConnector.prototype.doEventRecord = function(values ) {
    codapHelper.createCase(
        'events',
        values,
        this.gameCaseID
    ); // no callback.

};

/**
 * Construct the JSON object that initGame() sends to CODAP
 * @returns {{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}}
 */
EpiCODAPConnector.getInitSimObject = function() {
    var tColorMapObject = { };

    var i;

    Critter.eyeColors.forEach( function(iColor) {
        tColorMapObject[ iColor ] = iColor;
    })

    var oInitSimObject = {
        name: 'Epidemic',
        version : epiManager.kVersion,
        dimensions: {width: 404, height: 600},
        collections: [  // There are two collections: a parent and a child
            {
                name: 'epidemics',
                labels: {
                    singleCase: "epidemic",
                    pluralCase: "epidemics",
                    setOfCasesWithArticle: "a history"
                },
                // The parent collection spec:
                attrs: [
                    {name: "epiNumber", type: 'categorical', description : "epidemic number"},
                    {name: "moves", type: 'numeric',  precision: 0, description : "how many times you moved a critter"},
                    {name: "sickSecs", type: 'numeric', unit: 'seconds', precision: 2,
                        description : "total number of seconds critters were sick"},
                    {name: "elapsed", type: 'numeric', unit: 'seconds', precision: 2, description : "elapsed seconds"},
                    {name: "result", type: 'categorical', description : "game result"}
                ],
                childAttrName: "event"
            },
            {
                name: 'events',
                labels: {
                    singleCase: "event",
                    pluralCase: "events",
                    setOfCasesWithArticle: "an epidemic"
                },
                // The child collection specification:
                attrs: [
                    {name: "time", type: 'numeric', unit: 'seconds', precision: 2, description : "elapsed seconds"},
                    {name: "name", type: 'categorical', description : "critter's name"},
                    {
                        name: "result",
                        type: 'categorical',
                        colormap : { "healthy" : Critter.borderColors[0], "sick" : CritterView.kSickBorderColor },
                        description : "health status"
                    },
                    {name: "activity", type: 'categorical', colormap : Location.colorMap, description : "what the critter was doing"},
                    {name: "temp", type: 'numeric', precision: 1, description : "critter's temperature"},
                    {
                        name: "eyeColor",
                        type: 'categorical',
                        colormap: tColorMapObject,
                        description : "critter's eye color"
                    },
                    {name: "recordType", type: 'categorical', description : "why this record exists"},
                    {name: "location", type: 'categorical', description : "location ID"},
                    {name: 'row', type: 'categorical', description : "location's row"},
                    {name: 'col', type: 'categorical', description : "location's column"}
                ]
            }
        ]
    };

    return oInitSimObject;
};

/**
 * Construct the object this connector will need to be restored
 * @returns {{gameCaseID: *, gameNumber: *, gameCollectionName: *}}
 */
EpiCODAPConnector.prototype.getSaveObject = function() {
    var tState = {
        gameCaseID : this.gameCaseID,
        gameNumber : this.gameNumber,
        gameCollectionName : this.gameCollectionName
    };

    return tState;
};

/**
 * Restore this connector object from the stored object
 * @param iObject   object containing the property values.
 */
EpiCODAPConnector.prototype.restoreFrom = function( iObject ) {
    this.gameCaseID = iObject.gameCaseID;
    this.gameNumber = iObject.gameNumber;
    this.gameCollectionName = iObject.gameCollectionName;
};


/**
 * Called by CODAP to initialize the simulation.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */
codapHelper.initSim(
    EpiCODAPConnector.getInitSimObject(),
    epiManager.epiDoCommand         //  the callback needed
);

