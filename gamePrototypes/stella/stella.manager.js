/**
 * Created by tim on 5/7/16.


 ==========================================================================
 etaCas.manager.js in data-science-games.

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

/* global $, stella, Math, Planet, Star, SpectrumView, Snap, console, codapHelper, alert  */

stella.manager = {

    playing : false,
    focusStar : null,
    starResultType : null,
    starResultValue : null,
    stellaScore : 0,

    labSpectrumView : null,
    skySpectrumView : null,


    newGame: function () {

        stella.model.newGame();     //  make all the stars etc
        this.playing = true;
        stella.skyView.initialize( );

        this.skySpectrumView = new SpectrumView("skySpectrumDisplay");  //  ids of the two SVGs
        this.labSpectrumView = new SpectrumView("labSpectrumDisplay");

        stella.manager.emitInitialStarsData();  //      to get data at beginning of game. Remove if saving game data
        stella.manager.starResultType = $("#starResultTypeMenu").val();
        stella.manager.spectrumParametersChanged();
        stella.manager.updateStella();
    },

    updateStella : function() {
        stella.skyView.pointAtStar( this.focusStar );
        stella.model.skySpectrum = (this.focusStar === null) ? null :  this.focusStar.setUpSpectrum();
        this.displayAllSpectra();
        stella.ui.fixStellaUITextAndControls();      //  fix the text
    },

    pointAtStar : function( iStar ) {
        if (iStar) {
            this.focusStar = iStar;
            stella.connector.selectStarInCODAPByCatalogID( iStar.caseID );

            console.log("pointAtStar");
            console.log(this.focusStar);
        } else {
            this.focusStar = null;
        }
        this.updateStella();
    },

    changeMagnificationTo : function( iNewMag ) {

        stella.skyView.magnify( iNewMag  );
        this.updateStella();    //  this will also point at the focusStar, if any

    },

    runTests : function() {
        var tT = "testing\n";
        var d = $("#debugText");

        tT = "Stars\nmass, temp, M, mapp, ageMY, x, y, z\n";

        stella.model.stars.forEach( function(iStar ) {
            tT += iStar.toString() + "\n";
        });

        d.text( tT );       //  sends that data to debug
    },

    emitInitialStarsData : function() {

        stella.model.stars.forEach( function( iStar ) {
            var tValues = iStar.dataValues();
            tValues.date = stella.model.epoch;
            stella.connector.emitStarCatalogRecord( tValues, starRecordCreated );   //  emit the Stebber part

            function starRecordCreated(iResult ) {
                if (iResult.success) {
                    iStar.caseID = iResult.values[0].id;
                } else {
                    console.log("Failed to create case for star " + iStar.id );
                }
            }
        });


    },

    extractFromWithinBrackets : function( iString ) {
        if (iString ) {
            return iString.substring(iString.lastIndexOf("[") + 1, iString.lastIndexOf("]"));
        } else {
            return null;
        }
    },

    processSelectionFromCODAP : function( iResult ) {
        if (iResult && iResult.success) {
            if (iResult.values.length === 1) {
                var tStar =  stella.model.starFromCaseID( iResult.values[0].caseID );
                stella.manager.pointAtStar( tStar );
                stella.manager.updateStella();
            }
        } else {
            console.log('Failed to retrieve selected case IDs.');
        }
    },


    /*
            SPECTRA SECTION

     */

    spectrumParametersChanged : function() {
        this.setSpectrogramWavelengthsToTypedValues();       //  read min and max from boxes in the UI
        this.updateLabSpectrum();
        stella.manager.updateStella();
    },

    displayAllSpectra : function() {
        stella.manager.skySpectrumView.displaySpectrum( stella.model.skySpectrum );
        stella.manager.labSpectrumView.displaySpectrum( stella.model.labSpectrum );
    },

    saveSpectrumToCODAP : function(iWhich ) {

        var tSpectrum, tTitle, tSpectrumView, tChannels;

        switch (iWhich) {
            case "sky":
                tSpectrum = stella.model.skySpectrum;
                tSpectrumView = stella.manager.skySpectrumView;
                tChannels = tSpectrumView.zoomChannels;
                tTitle = stella.manager.focusStar.id;
                break;

            case "lab":
                tSpectrum = stella.model.labSpectrum;
                tSpectrumView = stella.manager.labSpectrumView;
                tChannels = tSpectrumView.zoomChannels;
                tTitle = stella.model.labSpectrum.source.shortid;
                break;

            default:
        }

        if (tSpectrumView.channels.length > 0) {
            stella.connector.emitSpectrum(tChannels, tTitle);
        }

    },


    updateLabSpectrum : function() {
        //  first, figure out the Lab spectrum
        var tSpectrumType = $('input[name=sourceType]:checked').val();
        stella.model.dischargeTube = $("#dischargeTubeMenu").val();

        if (tSpectrumType === "discharge") {
            stella.model.installDischargeTube(  );
        } else {
            stella.model.installBlackbody(  );
        }
    },


    setSpectrogramWavelengthsToTypedValues : function() {
        var tLMin = Number($("#lambdaMin").val());
        var tLMax = Number($("#lambdaMax").val());

        this.labSpectrumView.adjustLimits( tLMin, tLMax);
        this.skySpectrumView.adjustLimits( tLMin, tLMax);
    },

    clickInSpectrum: function (e) {
        var tSpecView = stella.manager.labSpectrumView; //  todo: maybe make this work on the target, in case the skySpectrumView is of a different dimension

        var uupos = tSpecView.paper.node.createSVGPoint();
        uupos.x = e.clientX;
        uupos.y = e.clientY;

        var ctm = e.target.getScreenCTM().inverse();

        if (ctm) {
            uupos = uupos.matrixTransform(ctm);
        }

        //  now calculate the wavelength that got clicked.

        var tLambda = 0;
        var tRange = tSpecView.lambdaMax - tSpecView.lambdaMin; //  range in the zoomed spectrum

        var tFrac = uupos.x / tSpecView.spectrumViewWidth;
        var tZoomFactor = 0.7;

        if (uupos.y <= tSpecView.mainSpectrumHeight) {
            var tTotalRange = tSpecView.lambdaMaxPossible - tSpecView.lambdaMinPossible;
            tLambda = tSpecView.lambdaMinPossible + tFrac * tTotalRange;
        } else if (uupos.y >= tSpecView.mainSpectrumHeight + tSpecView.interspectrumGap) {
            tLambda = tSpecView.lambdaMin + tFrac * tRange;
            if (tLambda < tSpecView.lambdaMin || tLambda > tSpecView.lambdaMax) {
                tZoomFactor = 1.0;      //      just translate if outside the zoom area
            }
        } else {
            tZoomFactor = 2.0;    //      zoom back out
            tLambda = (tSpecView.lambdaMax + tSpecView.lambdaMin) / 2;
        }

        tRange *= tZoomFactor;
        var tMin = tLambda - tRange / 2;
        var tMax = tLambda + tRange / 2;
        tMin = tMin < tSpecView.lambdaMinPossible ? tSpecView.lambdaMinPossible : tMin;
        tMax = tMax > tSpecView.lambdaMaxPossible ? tSpecView.lambdaMaxPossible : tMax;

        tMin = Math.round(tMin*10)/10.0;
        tMax = Math.round(tMax*10)/10.0;
        if (tMax - tMin < 1.0) {
            var tMid = (tMax + tMin)/2;
            tMax = tMid + 0.5;
            tMin = tMid - 0.5;
        }

        stella.manager.labSpectrumView.adjustLimits( tMin, tMax );
        stella.manager.skySpectrumView.adjustLimits( tMin, tMax );
        stella.manager.displayAllSpectra();
    },

/*      "STAR RESULT" SECTION     */

    starResultTypeChanged : function() {
        stella.manager.starResultType = $("#starResultTypeMenu").val();
        stella.manager.updateStella();
    },

    starResultValueChanged : function() {
        stella.manager.starResultValue = Number($("#starResultValue").val());
        stella.manager.updateStella();
    },

    saveStarResult: function () {
        if (stella.manager.focusStar) {
            var tValues = {
                id: stella.manager.focusStar.id,
                type: stella.manager.starResultType,
                value: stella.manager.starResultValue,
                date: stella.model.now,
                units: stella.starResults[stella.manager.starResultType].units
            };
            var tScore = stella.model.evaluateResult(tValues);
            if (tScore > 0) {
                stella.connector.emitStarResult(tValues, null);
                stella.manager.stellaScore += tScore;
            } else {
                alert( stella.strings.resultIsWayOff );
            }
        } else {
            alert(stella.strings.notPointingAtStarForResults);
        }

        stella.manager.updateStella();
    },



    /**
     * responds to CODAP notifications.
     */
    stellaDoCommand: function (iCommand, iCallback) {

        console.log("stellaDoCommand: ")
        console.log(iCommand);

        var tCommandObject = "";

        switch (iCommand.action) {
            case "notify":
                if (Array.isArray(iCommand.values)) {
                    switch (iCommand.values[0].operation) {

                        // todo: Note that this is set up to work only with the star catalog data set.
                        case "selectCases":
                            var tDataSet = stella.manager.extractFromWithinBrackets(iCommand.resource);
                            if (tDataSet === stella.connector.catalogDataSetName) {
                                codapHelper.getSelectionList(tDataSet, stella.manager.processSelectionFromCODAP);
                            }
                            break;

                        default:
                            break;
                    }
                } else {
                    var tOperation = iCommand.values.operation;
                    console.log("Values is not an array. Operation: " + tOperation);
                }
                break;

            case "get":
                console.log("stellaDoCommand: action : get.");
                switch (iCommand.resource) {
                    case "interactiveState":
                        console.log("stellaDoCommand save document ");
                        var tSaveObject = {
                            success: true,
                            values: {
                                foo : 3,
                                bar : "baz"
                            }
                        };
                        codapHelper.sendSaveObject(
                            tSaveObject,
                            function () {
                                console.log("Save complete?");
                            }
                        );
                        break;
                    default:
                        console.log("stellaDoCommand unknown get command resource: " + iCommand.resource );
                        break;
                }
                break;

            default:
                console.log("stellaDoCommand: no action.");
        }

    }
};