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



steb.options = {
    backgroundCrud : true,
    delayReproduction : false,
    reducedMutation : false,
    flee : true,
    eldest : false,

    useVisionParameters : false,
    predatorVisionType : null,

    predatorVisionChange : function() {
        this.setPredatorVisionParameters();
        steb.worldView.updateDisplayWithCurrentVisionParameters( );

    },

    setPredatorVisionParameters : function() {
        this.useVisionParameters = document.getElementById("visionUseParameters").checked;
        this.predatorVisionType = $('input[name=predatorVisionType]:checked').val();

        var tRed = Number($("#visionRed").val());
        var tGreen = Number($("#visionGreen").val());
        var tBlue = Number($("#visionBlue").val());

        steb.model.predatorVisionColorVector = { red :tRed, green : tGreen, blue : tBlue };
        steb.model.predatorVisionBWFormula = $("#visionFormula").val();

        console.log("Options. vector = " + steb.model.predatorVisionColorVector
            + " formula = " + steb.model.predatorVisionBWFormula);
    },

    /**
     *  Called whenever user clicks on an option. Sets the internal flags to match the UI.
     */
    optionChange : function() {
        this.backgroundCrud = document.getElementById("backgroundCrud").checked;
        this.delayReproduction = document.getElementById("delayReproduction").checked;
        this.reducedMutation = document.getElementById("reducedMutation").checked;
        this.flee = document.getElementById("flee").checked;
        this.eldest = document.getElementById("eldest").checked;

        steb.ui.fixUI();
    }


}