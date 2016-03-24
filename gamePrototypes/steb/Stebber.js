/**
 * Created by tim on 3/23/16.


 ==========================================================================
 Stebber.js in data-science-games.

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


var Stebber = function( iColor, iWhere ) {
    this.color = iColor ? iColor : [8, 8, 8];
    this.where = iWhere;
    this.setWhither();
};

Stebber.prototype.setWhither = function() {
    this.whither = steb.model.randomPlace();
};

Stebber.prototype.runFrom = function( iPoint ) {

};

Stebber.prototype.animationArrival = function() {
    this.where = this.whither;
    this.setWhither();
}

