/**
 * Created by tim on 3/27/16.


 ==========================================================================
 steb.options.js in data-science-games.

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

/* global steb, $, console */

steb.options = {
    backgroundCrud : true,
    delayReproduction : false,
    reducedMutation : false,
    flee : true,
    crudFlee : false,
    crudScurry : true,
    eldest : false,
    automatedPredator : false,
    fixedInitialStebbers : true,
    fixedInitialBG : false,

    useVisionParameters : false,
    predatorVisionType : null,

    automatedPredatorChoiceVisible : false,
    colorVisionChoiceVisible : false,

    redCoefficient : 1,
    greenCoefficient : 1,
    blueCoefficient : 1,

    currentPreset : 0,

    /**
     * User changed the vision params on the panel.
     * Therefore find out what those chnages were,
     * and make the world reflect them!
     */
    predatorVisionChange : function() {
        var tPredVisionVal = $('input[name=visionType]:checked').val();
        this.useVisionParameters = (tPredVisionVal === "mono");

        this.setPredatorVisionParameters();
        steb.worldView.updateDisplayWithCurrentVisionParameters( );
    },

    predatorTypeChange : function() {
        var tAutoPredVal = $('input[name=predatorType]:checked').val();
        this.automatedPredator = (tAutoPredVal === "auto");
    },

    /**
     * Set the underlying predator vision params based on the settings in the vision panel.
     */
    setPredatorVisionParameters : function() {
        if (!this.useVisionParameters ) { steb.model.predatorVisionDenominator = 1; }    //  avoids nasty zero divide :)

        this.predatorVisionType = $('input[name=predatorVisionType]:checked').val();

        var tRed = Number($("#visionRed").val());
        var tGreen = Number($("#visionGreen").val());
        var tBlue = Number($("#visionBlue").val());

        $("#redCoeffDisplay").text("red = " + steb.model.predatorVisionBWCoefficientVector[0]);
        $("#greenCoeffDisplay").text("green = " + steb.model.predatorVisionBWCoefficientVector[1]);
        $("#blueCoeffDisplay").text("blue = " + steb.model.predatorVisionBWCoefficientVector[2]);

        steb.model.predatorVisionColorVector = [ tRed, tGreen, tBlue ];
        //  steb.model.predatorVisionBWCoefficientVector is set directly by sliders. See steb.ui.js.initialize().

        console.log(
            "Options. Vision vector = " + JSON.stringify( steb.model.predatorVisionColorVector ) +
            " BW vector = " + JSON.stringify(steb.model.predatorVisionBWCoefficientVector)
        );

        steb.model.stebbers.forEach(function(s) { s.updateColorDistances(); });     //  update all stebbers to reflect new vision

    },

    doPreset : function( iPreset ) {

        this.currentPreset = iPreset;

        switch( iPreset ) {
            case 1:
                this.backgroundCrud = true;
                this.fixedInitialStebbers = true;
                this.fixedInitialBG = true;
                this.crudSameShapeAsStebbers = false;

                this.delayReproduction = false;
                this.reducedMutation = false;
                this.flee = true;
                this.crudFlee = false;
                this.crudScurry = true;
                this.eldest = false;

                this.colorVisionChoiceVisible = false;
                this.automatedPredatorChoiceVisible = false;

                break;

            case 2:
                this.backgroundCrud = true;
                this.fixedInitialStebbers = true;
                this.fixedInitialBG = true;
                this.crudSameShapeAsStebbers = false;

                this.delayReproduction = false;
                this.reducedMutation = false;
                this.flee = true;
                this.crudFlee = false;
                this.crudScurry = true;
                this.eldest = false;

                this.colorVisionChoiceVisible = true;
                this.automatedPredatorChoiceVisible = false;

                steb.model.predatorVisionColorVector = [0, 1, 0];
                break;

            case 3:
                this.backgroundCrud = true;
                this.fixedInitialStebbers = true;
                this.fixedInitialBG = true;
                this.crudSameShapeAsStebbers = false;

                this.delayReproduction = false;
                this.reducedMutation = false;
                this.flee = true;
                this.crudFlee = false;
                this.crudScurry = true;
                this.eldest = false;

                this.colorVisionChoiceVisible = true;
                this.automatedPredatorChoiceVisible = true;

                steb.model.predatorVisionColorVector = [0, 1, 0];
                break;

            default:
                break;
        }

        this.setUIToMatchValues();
    },

    /**
     *  Called whenever user clicks on an option. Sets the internal flags to match the UI.
     */
    optionChange : function() {
        this.currentPreset = 0;
        this.setOptionsToMatchUI();
    },

    setOptionsToMatchUI : function() {

        this.backgroundCrud = document.getElementById("backgroundCrud").checked;
        this.fixedInitialStebbers = document.getElementById("fixedInitialStebbers").checked;
        this.fixedInitialBG = document.getElementById("fixedInitialBG").checked;
        this.crudSameShapeAsStebbers = document.getElementById("crudSameShapeAsStebbers").checked;

        this.delayReproduction = document.getElementById("delayReproduction").checked;
        this.reducedMutation = document.getElementById("reducedMutation").checked;
        this.flee = document.getElementById("flee").checked;
        this.crudFlee = document.getElementById("crudFlee").checked;
        this.crudScurry = document.getElementById("crudScurry").checked;
        this.eldest = document.getElementById("eldest").checked;

        this.colorVisionChoiceVisible = document.getElementById("colorVisionChoiceVisible").checked;
        this.automatedPredatorChoiceVisible = document.getElementById("automatedPredatorChoiceVisible").checked;

        steb.ui.fixUI();
    },

    setUIToMatchValues : function() {
        document.getElementById("backgroundCrud").checked = this.backgroundCrud;
        document.getElementById("fixedInitialStebbers").checked = this.fixedInitialStebbers;
        document.getElementById("fixedInitialBG").checked = this.fixedInitialBG;
        document.getElementById("crudSameShapeAsStebbers").checked = this.crudSameShapeAsStebbers;

        document.getElementById("delayReproduction").checked = this.delayReproduction;
        document.getElementById("reducedMutation").checked = this.reducedMutation;
        document.getElementById("flee").checked =     this.flee;
        document.getElementById("crudFlee").checked = this.crudFlee;
        document.getElementById("crudScurry").checked = this.crudScurry;
        document.getElementById("eldest").checked = this.eldest;

        document.getElementById("colorVisionChoiceVisible").checked = this.colorVisionChoiceVisible;
        document.getElementById("automatedPredatorChoiceVisible").checked = this.automatedPredatorChoiceVisible;

        steb.ui.fixUI();
    }
};