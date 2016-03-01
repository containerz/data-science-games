/*
 ==========================================================================
 TEEUtils.js

 Collection of utility functions before they get merged into common.

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
 * Created by tim on 10/20/15.
 */


var     TEEUtils = {

    padIntegerToTwo : function( i ) {
        if (i == 0) return "00";
        if (i >= 10) return "" + i;
        else return "0"+i;
    },

    twoPlaces : function( x ) {
        return (Math.round( x * 100) / 100.0);
    },

    /**
     * A funky random Poisson function.
     * Use Knuth algorithm up to n = 100; normal approximation beyond that.
     * @param mean
     * @returns {number}
     */
    randomPoisson : function(mean) {

        if (mean > 100) {
            var sd = Math.sqrt(mean);
            return Math.round(randomNormal(mean, sd));   //  todo: use randomNormal from common
        }
        var L = Math.exp(-mean);
        var p = 1.0;
        var k = 0;
        do {
            k++;
            p *= Math.random();
        } while (p > L);
        return (k - 1);
    },

    /**
     * Random normal, Box-Muller transform. Use only one value.
     * @param mean
     * @param sd
     * @returns {*}
     */
    randomNormal : function(mean, sd) {
        var t1 = Math.random();
        var t2 = Math.random();

        var tZ = Math.sqrt(-2 * Math.log(t1)) * Math.cos(2 * Math.PI * t2);

        return mean + sd * tZ;
    },

    /**
     * Returns a random item from a list
     * @param a         the list
     * @returns {*}
     */
    pickRandomItemFrom : function(a) {
        var tL = a.length;
        var tR = Math.floor(Math.random() * tL);
        return a[tR];
    }

};

//  Thanks, stackOverflow!

Date.prototype.ISO_8601_string = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding
};

Date.prototype.BART_string = function() {
    var hh = this.getHours().toString();
    var ii = this.getMinutes().toString();

    return this.ISO_8601_string() + " " + (hh[1]?hh:"0"+hh[0]) + ":" + (ii[1]?ii:"0"+ii[0]);

};