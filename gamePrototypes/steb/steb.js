/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.js in data-science-games.

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

/* global Snap */

var steb = {};  //  the "upper level" central global. It holds steb.manager, steb.constants, etc.

/**
 * Set up for a session
 */
steb.initialize = function() {

    this.constants.captureSlope =       //  compute the slope for the capture probability function
        1.0 / (this.constants.certaintyDistance - this.constants.invisibilityDistance);
    this.ui.initialize();
    this.worldView.initialize();
    this.colorBoxView.initialize( );
};

/**
 * Color utility. Convert our array of 3 numbers in [0, 15] to a hex string.
 * @param iColor
 */
steb.makeColorString = function(iColor ) {
    var r = iColor[0] * 17;
    var g = iColor[1] * 17;
    var b = iColor[2] * 17;

    return Snap.rgb( r, g, b );
};

/**
 * Wrap motion onto a torus
 * @param val   the input value
 * @param lo    minimum
 * @param hi    maximum
 * @returns {*} the wrapped value
 */
steb.rangeWrap = function( val, lo, hi )    {
    if (val < lo) {val = hi;}
    if (val > hi) {val = lo;}
    return val;
};

/**
 * Pin value into a range
 * @param val   the input value
 * @param lo    minimum
 * @param hi    maximum
 * @returns {*} the pinned value
 */

steb.rangePin = function( val, lo, hi )    {
    if (val < lo) {val = lo;}
    if (val > hi) {val = hi;}
    return val;
};


/**
 * Constants for the Stebbing game
 * @type {{version: string, initialNumberOfStebbers: number, stebberViewSize: number, stebberSpeed: number, stebberColorMutationArray: number[], stebberColorReducedMutationArray: number[], worldViewBoxSize: number, numberOfCruds: number, crudSize: number, crudSpeed: number, crudColorMutationArray: number[], colorAnimationDuration: number, baseStebberSpeed: number, baseStebberAcceleration: number}}
 */
steb.constants = {
    version : "001f",

    dataSetName_Living : "LivingStebbers",
    dataSetName_Eaten : "EatenStebbers",

    initialNumberOfStebbers : 12,   //  12,
    numberOfCruds : 20,          //  20

    stebberColorMutationArray : [-2,-1,-1, 0, 0, 1, 1, 2],      //  how much Stebber children vary from their parents
    stebberColorReducedMutationArray : [-1, -0.5, -0.5, 0, 0, 0.5, 0.5, 1],   //  same if reduced mutation option selected
    crudColorMutationArray : [-0.8, -0.4, -0.1, 0,0.1,0.4,0.8],   //  how mcuh Crud varies from its original mean

    fixedStebberColor : [
        [4, 4, 8],
        [4, 12, 8],
        [12, 4, 8],
        [12, 12, 8],
        [4, 8, 4],
        [4, 8, 12],
        [12, 8, 4],
        [12, 8, 12],
        [8, 4, 4],
        [8, 4, 12],
        [8, 12, 4],
        [8, 12, 12]
    ],

    worldViewBoxSize : 1000.0,  //  size of the coordinate system (viewBox)

    stebberViewSize : 100,       //  100,
    crudSize : 100,

    colorAnimationDuration : 1000,  //  ms when the apparent color changes

    baseCrudSpeed : 80.0,  //  pixels per second
    baseStebberSpeed : 110.0,    //  pixels per second
    stebberSpeedRange : 40.0,    //  pixels per second
    baseCrudAcceleration : 600.0,
    baseStebberAcceleration : 600.0,

    predatorWaitTime : 0.2, //  0.5,    //  How long to wait after a meal before looking
    predatorLookTime : 0.1, //  0.4,    //  How long it takes to evaluate (and maybe lose) potential prey
    predatorStalkTime : 1.0,        //  how long you "stalk" prey before eating it.

    //  for computing probability of capture based on color distance
    invisibilityDistance : 1.1, //  color distance at which the probability of capture is zero.
    certaintyDistance : 8.0,    //  color distance at which the probability of capture is 1.0

    timeOutTime : 2000      //      ms to wait when you click on a Crud
};