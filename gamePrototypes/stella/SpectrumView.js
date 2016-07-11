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
/* global Spectrum, Snap, alert, stella, console */

var SpectrumView = function ( iSVGName) {
    this.paper = new Snap(document.getElementById( iSVGName ));        //      snap.svg paper
    //  this.initialize( this.paper.node.clientWidth, this.paper.node.clientHeight);
    this.initialize( 300, 60 );     //      todo: fix this kludge! Why can't we get the dimensions from the width and height in html? It works for stella.skyview!
};

SpectrumView.prototype.initialize = function ( iWidth, iHeight ) {
    this.totalSpectrumViewHeight = iHeight;
    this.spectrumViewWidth = iWidth;

    this.interspectrumGap = this.totalSpectrumViewHeight * 0.4;
    this.mainSpectrumHeight = this.totalSpectrumViewHeight * 0.2;
    this.zoomSpectrumHeight = this.totalSpectrumViewHeight - this.interspectrumGap - this.mainSpectrumHeight;

    this.lambdaMinPossible = Spectrum.constants.visibleMin;
    this.lambdaMaxPossible = Spectrum.constants.visibleMax;
    this.lambdaMin = Spectrum.constants.visibleMin;
    this.lambdaMax = Spectrum.constants.visibleMax;
    this.pixelMin = 0;
    this.pixelMax = this.spectrumViewWidth;
    this.nBins = 100;
    this.gain = 1.0;
    this.showNoData();

    this.paper.click( stella.manager.clickInSpectrum );

    console.log( "Initialize a spectrum view");

};



SpectrumView.prototype.adjustLimits = function( iMin, iMax )    {
    this.lambdaMin = iMin;
    this.lambdaMax = iMax;

    var tWidth = this.spectrumViewWidth;

    this.pixelMin = this.spectrumViewWidth * (this.lambdaMin - this.lambdaMinPossible) / (this.lambdaMaxPossible - this.lambdaMinPossible);
    this.pixelMax = this.spectrumViewWidth * (this.lambdaMax - this.lambdaMinPossible) / (this.lambdaMaxPossible - this.lambdaMinPossible);
};

SpectrumView.prototype.toString = function () {
    var out = "Spectrogram of " + this.spectrum.source.id + " " + this.lambdaMin + " - " + this.lambdaMax + " nm";

    return out;
};

SpectrumView.prototype.displaySpectrum = function (iSpectrum) {
    this.spectrum = iSpectrum;
    if (iSpectrum) {
        this.channels = this.spectrum.channelize(this.lambdaMinPossible, this.lambdaMaxPossible, this.nBins);   //  array of objects { intensity, min, max}
        this.zoomChannels = this.spectrum.channelize(this.lambdaMin, this.lambdaMax, this.nBins);   //  array of objects { intensity, min, max}
    }
    this.paintChannels();
};

SpectrumView.prototype.paintChannels = function () {

    var tNChannels = this.channels.length;
    if (tNChannels > 0) {
        this.paper.clear();
        this.paper.polygon(
            this.pixelMin, this.mainSpectrumHeight,
            this.pixelMax, this.mainSpectrumHeight,
            this.pixelMax, this.mainSpectrumHeight + this.interspectrumGap / 3,
            this.spectrumViewWidth, this.mainSpectrumHeight + this.interspectrumGap,
            0, this.mainSpectrumHeight + this.interspectrumGap,
            this.pixelMin, this.mainSpectrumHeight + this.interspectrumGap / 3
        ).attr({
            fill : "lightgray"
        });
        var tChannelWidthOnDisplay = this.spectrumViewWidth / (tNChannels);
        var tLeft;

        switch (this.displayType) {

            case "photo":

                //      "main" (whole) spectrum

                tLeft = 0;
                this.channels.forEach(function (ch) {
                    var tBaseIntensity = this.gain * ch.intensity / 100;     //  now in [0, 1]
                    if (tBaseIntensity > 1.0) {
                        tBaseIntensity = 1.0;
                    }

                    var tColor = SpectrumView.intensityAndWavelengthToRGB(tBaseIntensity, ch.min);
                    this.paper.rect(tLeft, 0, tChannelWidthOnDisplay, this.mainSpectrumHeight).attr({
                        fill: tColor
                    });
                    tLeft += tChannelWidthOnDisplay;
                }.bind(this));

                //  "zoom" spectrum

                tLeft = 0;  //  reset to left edge
                this.zoomChannels.forEach(function (ch) {
                    var tBaseIntensity = this.gain * ch.intensity / 100;     //  now in [0, 1]
                    if (tBaseIntensity > 1.0) {
                        tBaseIntensity = 1.0;
                    }

                    var tColor = SpectrumView.intensityAndWavelengthToRGB(tBaseIntensity, ch.min);
                    this.paper.rect(
                        tLeft,
                        this.mainSpectrumHeight + this.interspectrumGap,
                        tChannelWidthOnDisplay,
                        this.zoomSpectrumHeight).attr({
                        fill: tColor
                    });
                    tLeft += tChannelWidthOnDisplay;
                }.bind(this));
                break;


            default:
                break;
        }
    } else {
        this.showNoData();      //  this.initialize();
    }
};


SpectrumView.prototype.showNoData = function() {
    this.spectrum = null;
    this.channels = [];
    this.zoomChannels = [];
    this.displayType = SpectrumView.displayTypes[0];
    this.background = this.paper.rect(0, 0, this.paper.node.clientWidth, this.paper.node.clientHeight).attr({
        fill: "yellow"
    });
    this.paper.text(30, 20, "no data");

};

SpectrumView.prototype.invalidate = function () {
    this.paper.clear();
    this.paper.text(20, 15, "press the button to get the spectrum");
};

SpectrumView.displayTypes = ["photo", "rail"];

SpectrumView.intensityAndWavelengthToRGB = function (iSignal, iLambdaNM) {

    var Red, Green, Blue;

    if ((iLambdaNM >= 350) && (iLambdaNM < 440)) {
        Red = -(iLambdaNM - 440) / (440 - 350);
        Green = 0.0;
        Blue = 1.0;
    } else if ((iLambdaNM >= 440) && (iLambdaNM < 490)) {
        Red = 0.0;
        Green = (iLambdaNM - 440) / (490 - 440);
        Blue = 1.0;
    } else if ((iLambdaNM >= 490) && (iLambdaNM < 510)) {
        Red = 0.0;
        Green = 1.0;
        Blue = -(iLambdaNM - 510) / (510 - 490);
    } else if ((iLambdaNM >= 510) && (iLambdaNM < 580)) {
        Red = (iLambdaNM - 510) / (580 - 510);
        Green = 1.0;
        Blue = 0.0;
    } else if ((iLambdaNM >= 580) && (iLambdaNM < 645)) {
        Red = 1.0;
        Green = -(iLambdaNM - 645) / (645 - 580);
        Blue = 0.0;
    } else if ((iLambdaNM >= 645) && (iLambdaNM < 781)) {
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

    return Snap.rgb(255 * Red, 255 * Green, 255 * Blue);
};