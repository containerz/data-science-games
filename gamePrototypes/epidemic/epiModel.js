/**
 * Created by tim on 10/19/15.
 */
/*
 ==========================================================================
 epiModel.js

 Model for the med DSG.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

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

var epiModel;

epiModel = {

    numberOfCritters: 49,

    critters: [],
    locations: [],
    elapsed : 0,
    nMoves : 0,
    malady : null,

    /**
     * Update the entire model
     * @param dt this many seconds
     */
    update: function( dt ) {
        this.elapsed += dt;

        var i;
        for (i = 0; i < this.locations.length; i++) {
            this.locations[i].update(dt);
        }
        for (i = 0; i < this.critters.length; i++) {
            this.critters[i].update(dt);
        }

        epiModel.infect( dt );
    },

    /**
     * Adjust the model to reflect a new game
     */
    newGame: function() {

        this.initialize();

        /**
         * Create all the Locations. Use the index to determine where it is, etc.
         */
        for (var i = 0; i < epiGeography.numberOfLocations(); i++ ) {   //  todo: figure out if we have to eliminate these when the game ends!
            var L = new Location( i );
            this.locations.push( L );   // todo: fix so it's not a coincidence that the index is the index :)
        }

        /**
         * Create all the Critters.
         */
        for (var i = 0; i < this.numberOfCritters; i++) {       //  todo: do we have to eliminate these on game end??
            var tC = new Critter( i );

            var tLoc = TEEUtils.pickRandomItemFrom(this.locations);
            tC.initialize( tLoc );

            this.critters.push( tC );    //  add critter to our local array
        }

        //  pick a malady

        epiMalady.pickMalady( );
        epiMalady.initMalady( );
    },

    /**
     * Check if the end conditions are met: enough "sick seconds" or total elapsed seconds.
     * @returns {*}
     */
    endCheck : function() {
        var tEnd = null;

        if (!epiOptions.endlessGame) {
            var tSickSeconds = this.sicknessReport().totalElapsed;

            if (tSickSeconds > epiMalady.pSickSecondsToGameEnd) tEnd = "lost";
            if (this.elapsed > epiMalady.pTotalElapsedSecondsToGameEnd) tEnd = "won";
        }
        return tEnd;
    },

    /**
     * Update to mark iCritter as selected
     *
     * @param iCritter      which Critter to select
     * @param iReplace      if true, iCritter is now the only thing selected
     *                      if false, add iCritter to the set of selected Critters
     */
    selectCritter :  function(iCritter, iReplace) {
        if (iReplace) epiManager.clearSelection();
        iCritter.selected = true;
    },

    /**
     * A Critter arrives at a new Location.
     * @param o { critter; c, atLocation: L}
     */
    doArrival: function( o ) {      //  epiModel.doArrival({ critter; c, atLocation: L} );
        var tCritter = o.critter;
        var tLocation = o.atLocation;
        tCritter.moving = false;
        tCritter.x = tCritter.view.snapShape.attr("x");
        tCritter.y = tCritter.view.snapShape.attr("y");
        tCritter.currentLocation = tLocation;
        tCritter.destLoc = null;
        tLocation.addCritter( tCritter );
        tCritter.activity = Location.mainActivities[ tLocation.locType ];       //      do whatever they do here :)
        if (epiOptions.dataOnArrival) epiManager.emitCritterData( tCritter, "arrival");
        //  todo: fix it so that on game end, critters don't still arrive, making invalid cases.
        //  (Why are they invalid?)
    },


    /**
     * Create any new infections
     * @param dt    in this amount of time
     */
    infect: function( dt ) {
        switch( epiMalady.pMaladyNumber ) {
            case 0:
                this.infect0( dt );
                break;
            default:
                this.infect0( dt );
                break;
        }
    },

    /**
     * Does infection for disease #0. todo: move to epiMalady
     * @param dt
     */
    infect0 : function( dt ) {
        var i;
        for (i = 0; i < this.locations.length; i++) {
            var tLocation = this.locations[i];
            var tInfectionInLocation = (epiMalady.exposureInLocation( tLocation ) || tLocation.toxic);
            if (tInfectionInLocation) {
                tLocation.critters.forEach(function(c) {
                    epiMalady.possiblyInfectExposedCritter( c, dt )
                });
            }
        }
    },

    /**
     * Get an object containg the information you need to see how many are sick, etc.
     * @returns {{totalElapsed: string, numberSick: number}}
     */
    sicknessReport : function() {
        var totElapsed = 0;
        var nSick = 0;

        this.critters.forEach( function(c) {
            totElapsed += c.elapsedSick;
            if (c.health != 1) nSick++;
        } );

        return {totalElapsed : totElapsed.toFixed(2), numberSick : nSick};
    },

    /**
     * Given (game) coordinates, like from a mouse click, find the Location they're in.
     *
     * @param iX
     * @param iY
     * @returns {*}     theLocation
     */
    coordsToLocation: function( iX, iY) {
        return this.locations[ epiGeography.coordToLocationIndex( iX, iY)];
    },

    /**
     * Make a fresh, new, clean model.
     * Suitable for new game or a restore from a file.
     */
    initialize : function() {

        this.critters.forEach( function(c) { c.currentLocation = null;}); //    break pointer loop

        this.elapsed = 0;
        this.nMoves = 0;
        this.locations = [];
        this.critters = [];

    },

    /**
     * Make an object we can use to restore the model. Note that Critters and Locations are covered in this.arraySaveObject()
     * @returns {{numberOfCritters: *, elapsed: *, nMoves: *, malady: *, critters: *, locations: *}}
     */
    getSaveObject: function() {
        var tSaveObject = {
            numberOfCritters : this.numberOfCritters,
            elapsed : this.elapsed,
            nMoves : this.nMoves,
            malady : this.malady,
            critters : this.arraySaveObject( this.critters ),
            locations : this.arraySaveObject( this.locations )

        };
        return tSaveObject;
    },

    /**
     * Restore the model from the "saveObject". Note how we handle Locations ad Critters
     * @param iObject
     */
    restoreFrom: function( iObject ) {
        this.initialize( );     //  clean up all vars, esp critters and locations, now empty

        this.numberOfCritters = iObject.numberOfCritters;
        this.elapsed = iObject.elapsed;
        this.nMoves = iObject.nMoves;
        this.malady = iObject.malady;

        //  restore all locations

        iObject.locations.forEach( function( el ) {
                var tLoc = new Location( el.myIndex );  //  put it in the right place
                tLoc.restoreFrom( el );                 //   give it the right properties
                this.locations.push( tLoc );      //   add it to the array
            }.bind( this )
        );    //  so that "this" is the model inside the anonymous function

        //  restore all critters. Assumes locations all exist.
        iObject.critters.forEach( function( el ) {
                var tCrit = new Critter( -1 );
                tCrit.restoreFrom( el );
                this.critters.push( tCrit );
            }.bind( this )
        );
    },

    /**
     * Critters and Locations are arrays. Each class has save and restore, so we simply loop.
     * This creates an array of those "save objects"
     * @param array
     * @returns {Array}
     */
    arraySaveObject : function( array ) {
        var aResult = [];

        array.forEach( function (item) {
            tSaveObject = item.getSaveObject();
            aResult.push( tSaveObject );
        });

        return aResult;
    },

    /**
     * Restore each of the objects in the array. Called from epiModel.restoreFrom()
     * @param obj
     */
    arrayRestoreFromObject : function ( obj ) {
        var aResult = [];

        obj.forEach( function ( o ) {   //  o is the storage object for a critetr or location
            var tThing = o.restoreFrom()    // todo: messed up here . How do I know which thihg to restore from? Do I have to pass in the restore function?
        });
    }
};
