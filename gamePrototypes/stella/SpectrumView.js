/**
 * Created by tim on 5/23/16.



 ==========================================================================
 SpectrumView.js in data-science-games.

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
/* global Spectrum, Snap, alert */

var SpectrumView = function( iPaper ) {
    this.paper = iPaper;        //      snap.svg paper
    this.initialize();
};

SpectrumView.prototype.toString = function() {
    var out = "Spectrogram of " + this.spectrum.source.id + " " + this.lambdaMin + " - " + this.lambdaMax + " nm";

    return out;
};

SpectrumView.prototype.displaySpectrum = function(iSpectrum ) {
    this.spectrum = iSpectrum;
    if (iSpectrum) {
        this.channels = this.spectrum.channelize(this.lambdaMin, this.lambdaMax, this.nBins);   //  array of objects { intensity, min, max}
    }
    this.paintChannels();
};

SpectrumView.prototype.paintChannels = function( ) {

    var tNChannels = this.channels.length;
    if (tNChannels > 0) {
        this.paper.clear();
        var tChannelWidthOnDisplay = this.spectrumViewWidth / (tNChannels);
        var tLeft;

        switch (this.displayType) {

            case "photo":
                tLeft = 0;
                this.channels.forEach( function(ch){
                    var tBaseIntensity = this.gain  * ch.intensity / 100;     //  now in [0, 1]
                    if (tBaseIntensity > 1.0) { tBaseIntensity = 1.0; }

                    var tColor = SpectrumView.intensityAndWavelengthToRGB( tBaseIntensity , ch.min );
                    this.paper.rect( tLeft, 0, tChannelWidthOnDisplay, this.spectrumViewHeight).attr({
                            fill : tColor
                    });
                    tLeft += tChannelWidthOnDisplay;
                }.bind(this));
                break;

            case "rail":
                tLeft = 0;
                this.channels.forEach( function(ch){
                    var tBaseIntensity = spec.model.labSpectrographGain * ch.intensity / 100;  //  now it's [0,1]
                    if (tBaseIntensity > 1.0) { tBaseIntensity = 1.0; }

                    var tChannelHeight = this.spectrumViewHeight * tBaseIntensity;

                    var tColor = SpectrumView.intensityAndWavelengthToRGB( 1.00 , ch.min );
                    this.paper.rect( tLeft, this.spectrumViewHeight - tChannelHeight, tChannelWidthOnDisplay, tChannelHeight).attr({
                        fill : tColor
                    });
                    tLeft += tChannelWidthOnDisplay;
                }.bind(this));
                break;

            default:
                break;
        }
    } else {
        this.initialize();
    }
};

SpectrumView.prototype.initialize = function() {
    this.lambdaMin = Spectrum.constants.visibleMin;
    this.lambdaMax = Spectrum.constants.visibleMax;
    this.nBins = 100;
    this.gain = 1.0;
    this.spectrum = null;
    this.channels = [];
    this.displayType = SpectrumView.displayTypes[0];
    this.background = this.paper.rect(0, 0, this.paper.node.clientWidth, this.paper.node.clientHeight).attr({
        fill : "yellow"
    });
    this.paper.text( 30, 20, "no data");
    this.spectrumViewHeight = this.paper.node.clientHeight;
    this.spectrumViewWidth = this.paper.node.clientWidth;
};

SpectrumView.prototype.invalidate = function() {
    this.paper.clear();
    this.paper.text(20,15,"press the button to get the spectrum");
};

SpectrumView.displayTypes = ["photo", "rail"];

SpectrumView.intensityAndWavelengthToRGB = function(iSignal, iLambdaNM ) {

    var Red, Green, Blue;

    if((iLambdaNM >= 350) && (iLambdaNM<440)){
        Red = -(iLambdaNM - 440) / (440 - 350);
        Green = 0.0;
        Blue = 1.0;
    } else if ((iLambdaNM >= 440) && (iLambdaNM<490)){
        Red = 0.0;
        Green = (iLambdaNM - 440) / (490 - 440);
        Blue = 1.0;
    } else if ((iLambdaNM >= 490) && (iLambdaNM<510)){
        Red = 0.0;
        Green = 1.0;
        Blue = -(iLambdaNM - 510) / (510 - 490);
    } else if ((iLambdaNM >= 510) && (iLambdaNM<580)){
        Red = (iLambdaNM - 510) / (580 - 510);
        Green = 1.0;
        Blue = 0.0;
    } else if ((iLambdaNM >= 580) && (iLambdaNM<645)){
        Red = 1.0;
        Green = -(iLambdaNM - 645) / (645 - 580);
        Blue = 0.0;
    } else if ((iLambdaNM >= 645) && (iLambdaNM<781)){
        Red = 1.0;
        Green = 0.0;
        Blue = 0.0;
    } else {
        Red = 0.0;
        Green = 0.0;
        Blue = 0.0;
    }

    Red *= iSignal;
    Green *= iSignal;
    Blue *= iSignal;

    return Snap.rgb( 255 * Red, 255 * Green, 255* Blue );
};