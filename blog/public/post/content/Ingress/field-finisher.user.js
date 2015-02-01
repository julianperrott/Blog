// ==UserScript==
// @id             fieldFinisher@fly
// @name           IITC plugin: Field Finisher
// @category       Layer
// @version        1
// @updateURL      https://secure.jonatkins.com/iitc/release/plugins/fieldFinisher.meta.js
// @downloadURL    https://secure.jonatkins.com/iitc/release/plugins/fieldFinisher.user.js
// @description    [jonatkins-2014-10-06-150241] Draw lines on the map to indicate single links which will create a field. Enable from the layer chooser.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') window.plugin = function () { };

    // PLUGIN START ////////////////////////////////////////////////////////

    // use own namespace for plugin
    window.plugin.fieldFinisher = (function () {

        var lineModule = (function () {
            var EPSILON = 0.000001;

            // Code in this module was written by Martin Thoma.
            // http://martin-thoma.com/how-to-check-if-two-line-segments-intersect/

            /**
             * Calculate the cross product of two points.
             * @param a first point
             * @param b second point
             * @return the value of the cross product
             */
            var crossProduct = function (a, b) {
                return a.x * b.y - b.x * a.y;
            };

            /**
             * Check if bounding boxes do intersect. If one bounding box
             * touches the other, they do intersect.
             * @param a first bounding box
             * @param b second bounding box
             * @return <code>true</code> if they intersect,
             *         <code>false</code> otherwise.
             */
            var doBoundingBoxesIntersect = function (a, b) {
                return a[0].x <= b[1].x && a[1].x >= b[0].x && a[0].y <= b[1].y
                        && a[1].y >= b[0].y;
            };

            /**
             * Checks if a Point is on a line
             * @param a line (interpreted as line, although given as line
             *                segment)
             * @param b point
             * @return <code>true</code> if point is on line, otherwise
             *         <code>false</code>
             */
            var isPointOnLine = function (a, b) {
                // Move the image, so that a.first is on (0|0)
                var aTmp = { "first": { "x": 0, "y": 0 }, "second": { "x": a.second.x - a.first.x, "y": a.second.y - a.first.y } };
                var bTmp = { "x": b.x - a.first.x, "y": b.y - a.first.y };
                var r = crossProduct(aTmp.second, bTmp);
                return Math.abs(r) < EPSILON;
            };

            /**
             * Checks if a point is right of a line. If the point is on the
             * line, it is not right of the line.
             * @param a line segment interpreted as a line
             * @param b the point
             * @return <code>true</code> if the point is right of the line,
             *         <code>false</code> otherwise
             */
            var isPointRightOfLine = function (a, b) {
                // Move the image, so that a.first is on (0|0)
                var aTmp = { "first": { "x": 0, "y": 0 }, "second": { "x": a.second.x - a.first.x, "y": a.second.y - a.first.y } };
                var bTmp = { "x": b.x - a.first.x, "y": b.y - a.first.y };
                return crossProduct(aTmp.second, bTmp) < 0;
            };

            /**
             * Check if line segment first touches or crosses the line that is
             * defined by line segment second.
             *
             * @param first line segment interpreted as line
             * @param second line segment
             * @return <code>true</code> if line segment first touches or
             *                           crosses line second,
             *         <code>false</code> otherwise.
             */
            var lineSegmentTouchesOrCrossesLine = function (a, b) {
                return isPointOnLine(a, b.first)
                        || isPointOnLine(a, b.second)
                        || (isPointRightOfLine(a, b.first) ^ isPointRightOfLine(a,
                                b.second));
            };

            var getBoundingBox = function (a) {
                return [{
                    "x": Math.min(a["first"]["x"], a["second"]["x"]),
                    "y": Math.min(a["first"]["y"], a["second"]["y"])
                },
                        {
                            "x": Math.max(a["first"]["x"], a["second"]["x"]),
                            "y": Math.max(a["first"]["y"], a["second"]["y"])
                        }];
            };

            /**
             * Check if line segments intersect
             * @param a first line segment
             * @param b second line segment
             * @return <code>true</code> if lines do intersect,
             *         <code>false</code> otherwise
             */

            return {
                doLinesIntersect: function (a, b) {
                    var box1 = getBoundingBox(a);
                    var box2 = getBoundingBox(b);
                    var result1 = doBoundingBoxesIntersect(box1, box2)
                    var result2 = lineSegmentTouchesOrCrossesLine(a, b)
                    var result3 = lineSegmentTouchesOrCrossesLine(b, a);

                    var result = result1 && result2 && result3;

                    return result == true || result == 1;
                }
            }
        })();

        var portalsModule = (function () {

            // check if a portal has a link to another portal
            function isLinkedToPortal(portal, testId) {
                var result = false;

                portal.linkIndexes.forEach(function (id) {
                    if (id == testId) { result = true; }
                });

                return result;
            };

            // check if a link between two portals already exists
            function linkExists(allLinks, p1, p2) {
                for (var i = 0; i < allLinks.length; i++) {
                    if (allLinks[i][0] == p1 && allLinks[i][1] == p2) {
                        return true;
                    }
                }
                return false;
            };

            // calculate the area of a triangle
            function area(a, b, c) {
                var aX = a[0]; var aY = a[1];
                var bX = b[0]; var bY = b[1];
                var cX = c[0]; var cY = c[1];

                var result = ((aX * (bY - cY)) + (bX * (cY - aY)) + (cX * (aY - bY))) / 2;
                return Math.abs(result);
            }

            return {
                // find the portal in the array using the guid
                findPortalByGuid: function (portals, portalGuid) {
                    for (var i = 0; i < portals.length; i++) {
                        if (portals[i].Id == portalGuid) {
                            return i;
                        }
                    }
                    return -1;
                },

                // populate linkIndexes by matching the link guid to a portal and then storing its index
                SetlinkIndexes: function (portals) {
                    var that = this;

                    portals.forEach(function (portal) {
                        portal.linkIndexes = [];
                        portal.Links.forEach(function (portalGuid) {
                            var id = that.findPortalByGuid(portals, portalGuid);
                            if (id >= 0) { portal.linkIndexes.push(id); }
                        });
                    });
                },

                // find paths from a portal to a third portal via second portal
                get2ndLinkPaths: function (portals, originIndex) {
                    var paths = [];

                    portals[originIndex].linkIndexes.forEach(function (viaPortalIndex) {

                        if (viaPortalIndex == originIndex) { return; }

                        portals[viaPortalIndex].linkIndexes.forEach(function (thirdPortalIndex) {
                            if (originIndex == thirdPortalIndex || viaPortalIndex == thirdPortalIndex || isLinkedToPortal(portals[thirdPortalIndex], originIndex)) { return; }
                            paths.push([viaPortalIndex, thirdPortalIndex]);
                        });
                    });

                    return paths;
                },

                createAllLinks: function (portals) {
                    portals.allLinks = [];

                    for (var originIndex = 0; originIndex < portals.length; originIndex++) {

                        portals[originIndex].linkIndexes.forEach(function (toIndex) {

                            var portalFromIndex = (originIndex < toIndex) ? originIndex : toIndex;
                            var portalToIndex = (originIndex < toIndex) ? toIndex : originIndex;

                            if (!linkExists(portals.allLinks, portalFromIndex, portalToIndex)) {
                                portals.allLinks.push([portalFromIndex, portalToIndex])
                            }
                        });
                    };

                    portals.allLinks.sort();
                },


                isPathClear: function (portals, portalIndexFrom, portalIndexTo) {

                    var lineSegmentA = { first: { x: portals[portalIndexFrom].coord.lat, y: portals[portalIndexFrom].coord.lng }, second: { x: portals[portalIndexTo].coord.lat, y: portals[portalIndexTo].coord.lng } };

                    for (var linkIndex = 0; linkIndex < portals.allLinks.length; linkIndex++) {

                        var link = portals.allLinks[linkIndex];
                        if (link[0] == portalIndexFrom || link[0] == portalIndexTo || link[1] == portalIndexFrom || link[1] == portalIndexTo) {
                            // ignore links involving either of the segment ends
                            continue;
                        }

                        var lineSegmentB = { first: { x: portals[link[0]].coord.lat, y: portals[link[0]].coord.lng }, second: { x: portals[link[1]].coord.lat, y: portals[link[1]].coord.lng } };

                        if (lineModule.doLinesIntersect(lineSegmentA, lineSegmentB)) {
                            return false;
                        }
                    }

                    return true;
                },

                setFieldsToMake: function (portals) {
                    portals.fieldsToMake = [];
                    var that = this;

                    for (var originIndex = 0; originIndex < portals.length; originIndex++) {

                        this.get2ndLinkPaths(portals, originIndex)
                            .forEach(function (link) {
                                if (originIndex < link[1]) { // i > link[1]: this path will already have been found
                                    if (that.isPathClear(portals, originIndex, link[1])) {
                                        portals.fieldsToMake.push([originIndex, link[0], link[1]]);
                                    }
                                }
                            });
                    }
                },

                calculateNewFieldArea: function (portals) {

                    var s = 1016;

                    portals.fieldsToMakeArea = [];
                    portals.fieldsToMake.forEach(function (field) {

                        var p0 = portals[field[0]];
                        var p1 = portals[field[1]];
                        var p2 = portals[field[2]];

                        var ar = area([p0.coord.lat * s, p0.coord.lng * s], [p1.coord.lat * s, p1.coord.lng * s], [p2.coord.lat * s, p2.coord.lng * s]);
                        portals.fieldsToMakeArea.push(Math.floor(ar));
                    });
                },

                getFieldsToMake: function (portals) {
                    // work out fields to create
                    this.SetlinkIndexes(portals);
                    this.createAllLinks(portals);
                    this.setFieldsToMake(portals);
                    return portals.fieldsToMake;
                }
            }
        })();

        var style = { color: '#FF0000', opacity: 1, weight: 1.5, clickable: false, smoothFactor: 10, dashArray: [6, 4] };

        var portalCache = [];

        return {
            linksLayerGroup: null,

            // make a list of portals we want to investigate
            getPortalsToQuery: function () {
                var list = [];
                var bounds = map.getBounds();
                $.each(window.portals, function (guid, portal) {

                    if ((PLAYER.team == "ENLIGHTENED" && portal.options.team == 2) || (PLAYER.team != "ENLIGHTENED" && portal.options.team == 1)) {

                        var latlng = portal.getLatLng();
                        var links = window.getPortalLinks(portal.options.guid);
                        var ln = [];
                        links.out.forEach(function (linkGuid) { ln.push(window.links[linkGuid].options.data.dGuid); });
                        links.in.forEach(function (linkGuid) { ln.push(window.links[linkGuid].options.data.oGuid); });

                        list.push({ Name: portal.options.data.title, Id: portal.options.guid, coord: latlng, Links: ln });
                    }
                });
                return list;
            },

            updateLayer: function () {
                try {
                    if (!window.map.hasLayer(linksLayerGroup)) { return; }

                    var startTime = new Date().getTime();

                    linksLayerGroup.clearLayers();

                    // make a list of portals
                    var list = window.plugin.fieldFinisher.getPortalsToQuery();

                    // if the portal is not in the current portals then retrieve from the cache
                    portalCache.forEach(function (portal) {
                        if (portalsModule.findPortalByGuid(list, portal.Id) < 0) { list.push(portal); }
                    });

                    portalCache = list;

                    // work out fields to create
                    var fieldsToMake = portalsModule.getFieldsToMake(list);

                    // draw fields
                    fieldsToMake.forEach(function (field) {
                        var bounds = map.getBounds();
                        if (bounds.contains(list[field[0]].coord) || bounds.contains(list[field[2]].coord)) {
                            var poly = L.polyline([list[field[0]].coord, list[field[2]].coord], style);
                            poly.addTo(linksLayerGroup);
                        }
                    });

                    console.log("Fields to make: " + fieldsToMake.length);

                    var endTime = new Date().getTime() - startTime;
                    var elapsedTime = Math.floor(endTime / 100) / 10;
                    if (Math.round(elapsedTime) == elapsedTime) { elapsedTime += '.0'; }

                    console.log('Field Finisher Execution time: ' + elapsedTime);

                }
                catch (err) {
                    console.log(err);
                }
            },

            setup: function () {
                try {
                    linksLayerGroup = new L.LayerGroup();
                    window.addHook('mapDataRefreshEnd', window.plugin.fieldFinisher.updateLayer);
                    window.map.on('moveend', window.plugin.fieldFinisher.updateLayer);
                    window.addLayerGroup('Field Finisher', linksLayerGroup, false);
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
    })();

    var setup = window.plugin.fieldFinisher.setup;

    // PLUGIN END //////////////////////////////////////////////////////////


    setup.info = plugin_info; //add the script info data to the function as a property
    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);


