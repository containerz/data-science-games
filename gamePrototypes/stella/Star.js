/**
 * Created by tim on 5/7/16.


 ==========================================================================
 Star.js in data-science-games.

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

/**
 * Model class for stars
 */

/*
Notes on eta Cas itself:
Double. We'll talk about the primary:
V = 3.44
U-B = 0.02
B-V = 0.58
distance = 5.95 (pc)

Now the copmpanion, Eta Cassiopeiae B
 Period (P)	480 yr
 Semi-major axis (a)	11.9939"
 Eccentricity (e)	0.497
 Inclination (i)	34.76°
 Longitude of the node (Ω)	98.42°
 Periastron epoch (T)	1889.6
 Argument of periastron (ω) 88.59°
 (secondary)
 */

/**
 * Constructor
 * @constructor
 */

/* global Snap, Spectrum, stella, ElementalSpectra, TEEUtils */

/**
 * Notes on position
 * {x, y, r}
 * where x and y are IN DEGREES and r is in pc.
 */

/**
 * Construct a model Star. Called from stella.model.initGame()
 *
 * @param iFrustum  volume of space in which we choose a random spot
 * @param iMotion   motion parameters. An object with components in x, y, and r. Also has SDs.
 * @param iLogAge   log base 10 of the star's age. Will be used to see if it has evolved.
 * @constructor
 */

var Star = function( iStarData ) {

    this.logMass = Number(iStarData.logMass);
    this.logAge = Number(iStarData.logAge);
    this.id = iStarData.id;

    this.where = {
        x : Number(iStarData.x),
        y : Number(iStarData.y),
        z : Number(iStarData.z)
    };

    this.pm = {
        x : stella.pmFromSpeedAndDistance( Number(iStarData.vx), this.where.z),
        y : stella.pmFromSpeedAndDistance( Number(iStarData.vy), this.where.z),
        r : Number(iStarData.vz)
    };

    this.parallax = (1/this.where.z) * stella.constants.microdegreesPerArcSecond;   //  max in microdegrees

    //  what depends on mass and age...

    this.logMainSequenceRadius = (2/3) * this.logMass;
    this.logRadius = this.logMainSequenceRadius;
    this.logLuminosity = 3.5 * this.logMass;
    this.logMainSequenceTemperature = 3.76 + 13/24 * this.logMass;  //  3.76 = log10(5800), the nominal solar temperature
    this.logTemperature = this.logMainSequenceTemperature;      //  start on main sequence
    this.logLifetime = 10 + this.logMass - this.logLuminosity;
    this.myGiantIndex = 0;


    this.evolve( );     //  old enough to move off the MS?
    this.doPhotometry();    //  calculate UBV (etc) magnitudes
};

Star.prototype.csvLine = function( ) {
    var o = "";
    o = this.id + "," + this.logMass + "," + this.logAge + "," +
            this.where.x + "," + this.where.y + "," + this.where.z + "," +
            this.vx + "," + this.vy + "," + this.vr;

    return o;
};

Star.prototype.htmlTableRow = function() {
    var o = "<tr>";
    o += "<td>" + this.id + "</td>";
    o += "<td>" + this.logMass + "</td>";
    o += "<td>" + this.logAge + "</td>";
    o += "<td>" + this.mApp.toFixed(2) + "</td>";
    o += "<td>" + this.myGiantIndex.toFixed(2) + "</td>";
    o += "<td>" + this.where.z.toFixed(2) + "</td>";
    o += "</tr>";

    return o;
};

/**
 * Has this Star moved off the MS? If so, how much?
 * Answer is stored in this.myGiantIndex, which is 0 on the MS, (0,1) transitioning, 1 for giant, and 1000 for WD, NS, etc
 */
Star.prototype.evolve = function(  ) {
    var tAge = Math.pow(10, this.logAge);           //  current age
    this.myGiantIndex = this.computeGiantIndex( tAge );

    if (this.myGiantIndex <= 0) {
        this.myGiantIndex = 0;                 //      ON MAIN SEQUENCE. No evolution.
    } else if (this.myGiantIndex <= 1) {        //  GIANT phase
        /*
         Our model is, at this point, that as you age, you will maintain your luminosity,
         but your temperature will decline, linearly, to about 3000K
         (stella.constants.giantTemperature)
         */

        var tMSTemp = Math.pow(10, this.logMainSequenceTemperature);
        var tCurrentTemp = tMSTemp - (this.myGiantIndex * (tMSTemp - stella.constants.giantTemperature));
        tCurrentTemp -= 500.0 * Math.random();      //  some variety in giant temperatures.
        this.logTemperature = Math.log10(tCurrentTemp);
        this.logRadius = this.logMainSequenceRadius + 2.0 * (this.logMainSequenceTemperature - this.logTemperature);
        //  R goes like T^2 for constant luminosity (L goes as R^2T^4)
    } else {            //          WHITE DWARF or...
        var tRan = Math.random();
        this.logTemperature = 4 + tRan * 0.5;       //  hot! 10000 to 30000

        var tTempInSols = Math.pow(10, this.logTemperature) / stella.constants.solarTemperature;

        //  todo: THIS is where we would have decided how much mass is left, and if we'll make a neutron star or BH.

        this.logRadius = -2.0 - 0.3 * this.logMass;      //  see http://burro.cwru.edu/academics/Astr221/LifeCycle/WDmassrad.html
        //  now we know temperature and radius, we can compute luminosity:
        this.logLuminosity = 2 * this.logRadius + 4 * Math.log10( tTempInSols );
    }
};

/**
 * Star's position (as an object) at the current time, based on PM and parallax
 * @param iTime
 * @returns {{x: *, y: *, z: *}}
 */
Star.prototype.positionAtTime = function( iTime ) {

    var oWhere = {
        x : this.where.x,
        y : this.where.y,
        z : this.where.z
    };

    //  parallax

    var tParallaxMax = (1/this.where.z) * stella.constants.microdegreesPerArcSecond;
    var tFracYear = iTime % 1;      //  the fractional part of the year

    var tParallax = this.parallax * Math.cos( tFracYear * 2 * Math.PI);

    if (stella.options.parallax) {
        oWhere.x += tParallax * 0.000001;       //  because tParallax is in microdegrees
    }

    //  proper motion

    var iDT = iTime - stella.model.epoch;

    if (stella.options.properMotion) {
        oWhere.x += iDT * this.pm.x;
        oWhere.y += iDT * this.pm.y;
        oWhere.z += iDT * this.pm.r * 1.0e05 / stella.constants.parsec
    }

    return oWhere;
};

/**
 * Calculate apparent magnitude from absolute and distance
 * @param iAbsoluteMagnitude
 * @param iDistance
 * @returns {*}
 */
Star.apparentMagnitude = function( iAbsoluteMagnitude, iDistance ) {
    return iAbsoluteMagnitude + 5 * (Math.log10( iDistance ) - 1);
};

/**
 * Make THIS star's spectrum.
 * Only need it when we have to put it up, so we don't store it.
 * @returns {Spectrum}
 */
Star.prototype.setUpSpectrum = function() {
    var tSpectrum = new Spectrum();
    tSpectrum.hasAbsorptionLines = true;
    tSpectrum.hasEmissionLines = false;
    tSpectrum.hasBlackbody = true;
    tSpectrum.blackbodyTemperature = Math.pow(10, this.logTemperature);

    //  NB: no Lithium
    tSpectrum.addLinesFrom(ElementalSpectra.H, 50 * Spectrum.linePresenceCoefficient("H", this.logTemperature));
    tSpectrum.addLinesFrom(ElementalSpectra.HeI, 30 * Spectrum.linePresenceCoefficient("HeI", this.logTemperature));
    tSpectrum.addLinesFrom(ElementalSpectra.NaI, 40 * Spectrum.linePresenceCoefficient("NaI", this.logTemperature));
    tSpectrum.addLinesFrom(ElementalSpectra.CaII, 30 * Spectrum.linePresenceCoefficient("CaII", this.logTemperature));
    tSpectrum.addLinesFrom(ElementalSpectra.FeI, 30 * Spectrum.linePresenceCoefficient("FeI", this.logTemperature));

    tSpectrum.speedAway = this.pm.r * 1.0e05;    //      cm/sec, right??
    tSpectrum.source.id = this.id;

    return tSpectrum;
};

/**
 * Stellar Evolution. Where it is, and how it depends on age and (ms) lifetime.
 * @param iAge
 * @returns {number}
 */
Star.prototype.computeGiantIndex = function(iAge ) {
    var result = 0;
    var tTimeOnMS = Math.pow(10, this.logLifetime);
    var tTimeAcross = tTimeOnMS;  //  for now, the same time across as on MS
    var tTimeAsGiant = tTimeOnMS;  //  for now, the same time as giant as on MS

    if (iAge < tTimeOnMS)  {
        result = 0;
    } else if (iAge < tTimeOnMS + tTimeAcross) {
        result = (iAge - tTimeOnMS) / tTimeAcross;
    } else if (iAge < tTimeOnMS + tTimeAcross + tTimeAsGiant) {
        result = 1.0;
    } else {
        result = 1000;    //  past nova!
    }

    return result;
};

/**
 * UBV photometry using blackbody.
 * Assume Sun = 5800K, and all its absolute magnites are as listed.
 */
Star.prototype.doPhotometry = function() {

    this.mAbs = 4.85 - 2.5 * this.logLuminosity;
    this.mApp = Star.apparentMagnitude( this.mAbs, this.where.z );

    var solarU = 5.61;  //  solar mags from http://www.ucolick.org/~cnaw/sun.html
    var solarB = 5.48;
    var solarV = 4.83;
    var solarR = 4.42;
    var solarI = 4.08;

    var tSolar = 5800;

    var tTemp = Math.pow(10, this.logTemperature);
    var tRadius = Math.pow(10, this.logRadius);

    var L_solarU = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaU, tSolar);
    var L_solarB = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaB, tSolar);
    var L_solarV = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaV, tSolar);
    var L_star_U = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaU, tTemp) * tRadius * tRadius;
    var L_star_B = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaB, tTemp) * tRadius * tRadius;
    var L_star_V = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaV, tTemp) * tRadius * tRadius;

    this.uAbs = solarU - 2.5 * Math.log10( L_star_U / L_solarU);
    this.bAbs = solarB - 2.5 * Math.log10( L_star_B / L_solarB);
    this.vAbs = solarV - 2.5 * Math.log10( L_star_V / L_solarV);

};

/**
 * Make the object we can use to put a row in the Catalog.
 *
 * @returns {{x: string, y: string, m: string, id: *, U: string, B: string, V: string}}
 */
Star.prototype.dataValues = function() {
    var out = {
        x : this.where.x.toFixed(6),
        y : this.where.y.toFixed(6),
        m : this.mApp.toFixed(2),
        id : this.id,
        U : Star.apparentMagnitude( this.uAbs, this.where.z ).toFixed(2),
        B : Star.apparentMagnitude( this.bAbs, this.where.z ).toFixed(2),
        V : Star.apparentMagnitude( this.vAbs, this.where.z ).toFixed(2)
    };

    return out;
};

/**
 * String version of me
 * @returns {string}
 */
Star.prototype.toString = function() {
    var out = Math.pow(10, this.logMass).toFixed(2);
    out += ", " + Math.round(Math.pow(10, this.logMainSequenceTemperature));
    out += ", " + this.mAbs.toFixed(2);
    out += ", " + this.mApp.toFixed(2);
    out += ", " + Math.round(Math.pow(10, this.logLifetime - 6));
    out += ", " + this.where.x.toFixed(2) + ", " + this.where.y.toFixed(2) + ", " + this.where.z.toFixed(2);

    return out;
};

/**
 * Very short ID string useful for the status bar
 * @returns {string}
 */
Star.prototype.infoText = function() {
    var out = this.id + " m = " +  this.mApp.toFixed(2);

    return out;
};

//------------------------------------------
//      VIEW class

/**
 * Make a new StarView.
 * @param iStar     which Star
 * @param iPaper    the paper of the SKY, to which we attach this view
 * @constructor
 */
var StarView = function( iStar, iPaper ) {
    this.star = iStar;          //  view knows about the model

    var tOpacity = 1.0;
    var tRadius = 1;
    var tDegreesPerPixel = stella.constants.universeWidth / stella.skyView.magnification / stella.skyView.originalViewWidth;
    var tGray = 17;
    var tMagnitudeElbow, tMagnitudeLimit;

    //  The scale and brightness of stars depends on magnification

    switch (stella.skyView.magnification) {
        case 1:
            tMagnitudeElbow = 0.0;      //  magnitude at which stars are fully white but different sizes
            tMagnitudeLimit = 11.0;     //  below this magntude, stars are fully transparent
            break;
        case 10:
            tMagnitudeElbow = 6.0;
            tMagnitudeLimit = 14.0;
            break;
        case 100:
            tMagnitudeElbow = 12.0;
            tMagnitudeLimit = 17.0;
            break;
        default:
            tMagnitudeElbow = 0.0;
            tMagnitudeLimit = 7.0;
            break;
    }

    if (iStar.mApp < tMagnitudeElbow) {
        tRadius *= tMagnitudeElbow - iStar.mApp + 1;
    } else if (iStar.mApp < tMagnitudeLimit) {
        tOpacity = (tMagnitudeLimit - iStar.mApp) / (tMagnitudeLimit - tMagnitudeElbow);
    } else {
        tOpacity = 0.0;
    }

    var tColor = Snap.rgb( tGray * 15, tGray * 15, tGray * 15 );    //  put color in here of we want

    //  convert to current positions!

    var tCurrentWhere = iStar.positionAtTime( stella.model.now );

    //  actually make the circle! Be sure to reverse the y coordinate.

    if (tOpacity > 0) {
        var tRadiusInDegrees = tRadius * tDegreesPerPixel;
        var tCircle = iPaper.circle(tCurrentWhere.x, stella.constants.universeWidth - tCurrentWhere.y, tRadiusInDegrees ).attr({
            fill: tColor,
            fillOpacity: tOpacity
        });
        tCircle.dblclick( stella.manager.doubleClickOnAStar );
    }

};


/*      OLD CONSTRUCTOR

 var Star = function( iFrustum, iMotion, iLogAge ) {
 this.caseID = -1;

 var t1 = Math.random();
 var t2 = (1 - t1) * (1 - t1);
 this.logMass = (stella.constants.maxStarLogMass - stella.constants.minStarLogMass) * t2 - 1;
 this.logMainSequenceRadius = (2/3) * this.logMass;
 this.logRadius = this.logMainSequenceRadius;
 this.logLuminosity = 3.5 * this.logMass;
 this.logMainSequenceTemperature = 3.76 + 13/24 * this.logMass;  //  3.76 = log10(5800), the nominal solar temperature
 this.logTemperature = this.logMainSequenceTemperature;      //  start on main sequence
 this.logLifetime = 10 + this.logMass - this.logLuminosity;
 this.logAge = null;
 this.myGiantIndex = 0;

 this.vx = TEEUtils.randomNormal( iMotion.x, iMotion.sx);
 this.vy = TEEUtils.randomNormal( iMotion.y, iMotion.sy);
 this.vr = TEEUtils.randomNormal( iMotion.r, iMotion.sr);

 var tDistanceCubed = Math.pow(iFrustum.L1,3) +  Math.random() * (Math.pow(iFrustum.L2,3) - Math.pow(iFrustum.L1,3));

 this.where = {
 x : iFrustum.xMin + Math.random() * iFrustum.width,
 y : iFrustum.yMin + Math.random() * iFrustum.width,
 z : Math.pow(tDistanceCubed, 0.333)
 };

 this.pm = {
 x : stella.pmFromSpeedAndDistance( this.vx, this.where.z),
 y : stella.pmFromSpeedAndDistance( this.vy, this.where.z),
 r : this.vr
 };

 this.id = 42;       //  placeholder. Gets set elsewhere.
 this.logAge = iLogAge;

 this.evolve( );     //  old enough to move off the MS?
 //  this.spectrum = this.setUpSpectrum();
 this.doPhotometry();    //  calculate UBV (etc) magnitudes
 };
 */
