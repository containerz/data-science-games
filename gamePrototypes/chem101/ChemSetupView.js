/**
 * Created by tim on 9/11/16.


 ==========================================================================
 ChemSetupView.js in gamePrototypes.

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


ChemSetupView = function( iDOMString ) {

    this.myDOMElement = document.getElementById( iDOMString );
    this.paper = Snap( this.myDOMElement );
    this.myWidth = Number(this.paper.attr("width"));
    this.myHeight = Number(this.paper.attr("height"));

    this.backgroundRectangle = this.paper.rect(
        0, 0, this.myWidth, this.myHeight
    ).attr( {fill : "#dee"});

    this.equipmentViews = [];

};

ChemSetupView.prototype.updateView = function( ) {

    this.equipmentViews.forEach(
        function( e ) {
            e.updateEquipmentView();
        }
    );
};


ChemSetupView.prototype.addEquipmentView = function( iEquipView, iX, iY ) {

    this.paper.append(
        iEquipView.paper.attr({
            x: iX - iEquipView.origin.x,
            y: this.myHeight - iY - iEquipView.origin.y     //  nb: reverse y-coords, put axis at bottom
        })
    );

    this.equipmentViews.push( iEquipView );
    this.updateView();
};