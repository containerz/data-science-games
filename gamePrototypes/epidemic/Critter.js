/*
 ==========================================================================
 Critter.js

 Critter class for the med DSG.

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
 * Created by tim on 10/19/15.
 */

/**
 * Model class for Critters. See also CritterView.js.
 *
 * @param index
 * @constructor
 */
var Critter = function( index ) {
    this.myIndex = index;
    this.currentLocation = null;

    this.x = 0;
    this.y = 0;
    this.destX = 0;
    this.destY = 0;
    this.destLoc = null;
    this.speed = 100; // game units per second

    this.motivation = null;
    this.activity = null;

    this.moving = Boolean(false);

    this.health = 1.0;      //  0 = sick, 1 = healthy
    this.infectious = false;

    this.name = null;
    this.eyeColor = pickRandomItemFrom(Critter.eyeColors);
    this.borderColor = Critter.borderColors[0];
    this.baseTemperature = (this.eyeColor == Critter.eyeColors[0]) ? 36.0 : 34.5 ;
    this.baseTemperature += Math.random() * 0.6;
    this.baseTemperature -= Math.random() * 0.6;

    this.view = new CritterView( this );
};

/**
 * Update the internal values
 * @param dt    amount of time that has passed since the last update
 */
Critter.prototype.update = function (dt) {
    this.motivation.update( dt );
    this.view.update( this, dt );
    this.temperature = this.findTemperature();

    if (!this.moving && !this.activity) {   //  idle critter!
        var tCritterNeeds = this.motivation.mostUrgentNeed();

        if (tCritterNeeds.urgency > 2.0) {  //  bigger need
            if (tCritterNeeds.what === this.currentLocation.locType) {
                this.activity = tCritterNeeds.bestActivity;
            } else {
                this.setNewDest( );      //  sets destLoc, destX, and destY
                this.startMove();
            }
        }
    }
};

/**
 * Get a temperature reading for this Critter.
 */
Critter.prototype.findTemperature = function() {
    var tTemp;
    tTemp = (this.health == 0) ? this.baseTemperature + 1.1 : this.baseTemperature;
    tTemp += Math.random() * 0.2;
    tTemp -= Math.random() * 0.2;
    return tTemp;
};

/**
 * Set a new destination for this Critter.
 * This is based on its needs (see Motivation)
 * and the distances to Locations that can meet the needs.
 * We are playing around with picking locations that may not be the absolute closest.
 */
Critter.prototype.setNewDest = function( ) {
    var tCritterNeeds = this.motivation.mostUrgentNeed().what;
    var tClosestDistance = Number.MAX_VALUE;
    var i;
    var tBestLocations = [];

    // todo: figure out whether this system biases towards 0,0 (because the test is strictly less than, or the origin adjustment)
    for (i = 0; i < epiGeography.numberOfLocations(); i++) {
        var tTestLocation = epiModel.locations[i];
        if (tTestLocation != this.currentLocation && tTestLocation.locType == tCritterNeeds) {
            var tTestDistance = this.distanceToLoc( tTestLocation);
            if (tTestDistance < tClosestDistance - epiGeography.kPixelsWide) {  //  with some slop
                tClosestDistance = tTestDistance;
                tBestLocations = [tTestLocation];
            } else if (tTestDistance < tClosestDistance + epiGeography.kPixelsWide) {
                tBestLocations.push( tTestLocation );
            }
        }
    }
    var tDestLoc = pickRandomItemFrom(tBestLocations);

    this.destLoc = tDestLoc;
    var tCenter = tDestLoc.centerCoordinates();     //  for now, head for center of the loc

    this.destX = tCenter.x;
    this.destY = tCenter.y;
};

/**
 * Begin a move to a new location. Note that this calls Snap.svg's animate function, and
 * then uses epiModel.doArrival as a callback.
 */
Critter.prototype.startMove = function() {
    epiModel.doDeparture( {critter: this, fromLocation: this.currentLocation });
    var tTime = this.distanceToLoc( this.destLoc ) / this.speed;
    this.view.snapShape.animate(
        {"x" : this.destX, "y" : this.destY},
        tTime * 1000, null,
        function() {
            epiModel.doArrival({ critter: this, atLocation: this.destLoc} );
        }.bind(this)
    );
};

/**
 * Starts a "jiggle" move, that is, re-line-up in response to
 * a new Critter joining this Location.
 * "Destination" is within the Location.
 * @param destination
 */
Critter.prototype.startJiggleMove = function( destination ) {
    this.view.snapShape.stop();
    this.view.snapShape.animate(
        { "x": destination.x, "y": destination.y },
        1000, null,
        null
    );
};

/**
 * Set up initial values for this Critter
 * @param where
 */
Critter.prototype.initialize = function( where ) {
    this.name = medNames.newName( );
    this.currentLocation = where;
    this.x = where.snapShape.attr("x");
    this.y = where.snapShape.attr("y");
    this.view.moveTo( this.x, this.y );
    this.motivation = new Motivation( this );

    where.addCritter(this);

};

/**
 * How far is the given location?
 * @param L     the Location in question
 * @returns {number}
 */
Critter.prototype.distanceToLoc = function( L ) {
    var tLocW = Number(L.snapShape.attr("width"));
    var tLocX = Number(L.snapShape.attr("x")) + tLocW/2;
    var tLocY = Number(L.snapShape.attr("y")) + tLocW/2;   //  todo: fix for height
    var tdx = tLocX - this.x;
    var tdy = tLocY - this.y;
    return Math.sqrt( tdx * tdx + tdy * tdy);
};


Critter.prototype.toString = function() {
    return "C " + this.myIndex + " mot "
        + this.motivation
    ;
};

Critter.eyeColors = ["violet", "fuchsia"];
Critter.borderColors = ["orange"];