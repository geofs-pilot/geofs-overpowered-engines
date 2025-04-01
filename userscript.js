// ==UserScript==
// @name         GeoFS Overpowered engines
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  sets engine performance really high
// @author       geofs-pilot
// @match        https://www.geo-fs.com/*
// @grant        none
// ==/UserScript==


(function() {
    'use strict';
    function toggleAircraftProperties() {
    let isOverpowered = false;
    let originalValues = { thrust: {}, zeroThrustAltitude: null, zeroRPMAltitude: null };
    let lastAircraftID = geofs?.aircraft?.instance?.aircraftRecord?.id || null;

    function applyOverpoweredProperties() {
        if (geofs?.aircraft?.instance) {
            const aircraft = geofs.aircraft.instance;

            if (originalValues.zeroThrustAltitude === null && aircraft.definition?.zeroThrustAltitude !== undefined) {
                originalValues.zeroThrustAltitude = aircraft.definition.zeroThrustAltitude;
            }

            if (originalValues.zeroRPMAltitude === null && aircraft.definition?.zeroRPMAltitude !== undefined) {
                originalValues.zeroRPMAltitude = aircraft.definition.zeroRPMAltitude;
            }

            if (aircraft.definition) {
                aircraft.definition.zeroThrustAltitude = 300000;
                aircraft.definition.zeroRPMAltitude = 300000;
            }

            if (aircraft.parts) {
                for (let partName in aircraft.parts) {
                    let part = aircraft.parts[partName];
                    if (part?.thrust !== undefined) {
                        if (!originalValues.thrust[partName]) {
                            originalValues.thrust[partName] = {
                                thrust: part.thrust,
                                afterBurnerThrust: part.afterBurnerThrust || null
                            };
                        }
                        part.thrust = 900000;
                        if (part.afterBurnerThrust !== undefined) {
                            part.afterBurnerThrust = 900000;
                        }
                    }
                }
            }
        }
    }

    function applyNormalProperties() {
        if (geofs?.aircraft?.instance) {
            const aircraft = geofs.aircraft.instance;

            if (aircraft.definition) {
                if (originalValues.zeroThrustAltitude !== null) {
                    aircraft.definition.zeroThrustAltitude = originalValues.zeroThrustAltitude;
                }
                if (originalValues.zeroRPMAltitude !== null) {
                    aircraft.definition.zeroRPMAltitude = originalValues.zeroRPMAltitude;
                }
            }

            if (aircraft.parts) {
                for (let partName in originalValues.thrust) {
                    let part = aircraft.parts[partName];
                    if (part?.thrust !== undefined) {
                        part.thrust = originalValues.thrust[partName].thrust;
                        if (part.afterBurnerThrust !== undefined && originalValues.thrust[partName].afterBurnerThrust !== null) {
                            part.afterBurnerThrust = originalValues.thrust[partName].afterBurnerThrust;
                        }
                    }
                }
            }
        }
    }

    function toggleProperties() {
        if (isOverpowered) {
            applyNormalProperties();
            isOverpowered = false;
            console.log("Aircraft properties set to normal.");
            ui.notification.show("Aircraft properties set to normal.");
        } else {
            applyOverpoweredProperties();
            isOverpowered = true;
            console.log("Aircraft properties set to overpowered mode.");
            ui.notification.show("Aircraft properties set to overpowered mode.");
        }
    }

    document.addEventListener("keydown", function (event) {
    if (event.key.toLowerCase() === "q"  && !e.ctrlKey && !e.altKey && !e.metaKey) {
        toggleProperties();
    }
});


    console.log("Press 'Q' to toggle aircraft properties between normal and overpowered.");

    // Monitor aircraft changes
    setInterval(() => {
        let currentAircraftID = geofs?.aircraft?.instance?.aircraftRecord?.id || null;
        if (currentAircraftID !== lastAircraftID) {
            console.log("Aircraft changed, resetting toggle.");
            originalValues = { thrust: {}, zeroThrustAltitude: null, zeroRPMAltitude: null };
            isOverpowered = false;
            lastAircraftID = currentAircraftID;
        }
    }, 500); // Check every 500ms
}

toggleAircraftProperties();
})();
