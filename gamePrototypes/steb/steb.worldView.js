/**
 * Created by tim on 3/23/16.


 ==========================================================================
 worldView.js in data-science-games.

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


steb.worldView = {
    paper : null,

    flush : function() {
        this.paper.clear();
        this.makeBackground();
    },

    addStebber : function( iStebberView, iLocation ) {
        iStebberView.paper.attr({
            x : iLocation.x - steb.constants.stebberViewSize/2,
            y : iLocation.y - steb.constants.stebberViewSize/2
        });
        this.paper.append( iStebberView.paper);
    },

    removeStebberView : function( iStebberView )    {
        iStebberView.paper.remove(  );
        //  need to remove the StebberView object??
    },

    makeBackground : function() {
        this.paper.rect(0, 0, 1000, 1000).attr({
            fill: "dodgerblue"
        })

    },

    initialize : function() {
        this.paper = Snap(document.getElementById("stebSnapWorld"));
        this.paper.attr({
            viewBox : "0 0 1000 1000"
        });

        this.makeBackground();
    }
}