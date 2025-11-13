// ==UserScript==
// @name         GeoFS Overpowered engines
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  sets engine performance really high
// @author       geofs-pilot
// @match        https://www.geo-fs.com/*
// @grant        none
// ==/UserScript==

let originalValues = { thrust: {}, zeroThrustAltitude: null, zeroRPMAltitude: null };

function toggleAircraftProperties() {
    globalThis.isOverpowered = false;
    let lastAircraftID = geofs?.aircraft?.instance?.aircraftRecord?.id || null;
    let mass = geofs.aircraft.instance.definition.mass;
    let thrustBoostFactor = 6;

    function applyOverpoweredProperties() {
    if (geofs?.aircraft?.instance) {
        const aircraft = geofs.aircraft.instance;
        mass = aircraft.definition.mass;

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
                            afterBurnerThrust: part.afterBurnerThrust || null,
                            reverseThrust: part.reverseThrust || null
                        };
                    }

                    let thrustValue, afterburnerValue, reverseValue;

                    let numThrust = Number(originalValues.thrust[partName].thrust);
                    thrustValue = numThrust * thrustBoostFactor;
                    if (originalValues.thrust[partName].afterBurnerThrust !== null) {
                        afterburnerValue = originalValues.thrust[partName].afterBurnerThrust * thrustBoostFactor;
                    } else {
                        afterburnerValue = thrustValue;
                    }

                    let numReverse = Number(originalValues.thrust[partName].reverseThrust);
                    reverseValue = numReverse * thrustBoostFactor
                    console.log(originalValues.thrust);
                    console.log(thrustValue);
                    part.thrust = thrustValue;
                    if (part.afterBurnerThrust !== undefined) {
                        part.afterBurnerThrust = afterburnerValue;
                    }
                    if (part.reverseThrust !== undefined) {
                        part.reverseThrust = reverseValue;
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

                        if (part.reverseThrust !== undefined && originalValues.thrust[partName].reverseThrust !== null) {
                            part.reverseThrust = originalValues.thrust[partName].reverseThrust;
                        }
                    }
                }
            }
        }
    }

    function toggleProperties() {
        if (globalThis.isOverpowered) {
            applyNormalProperties();
            globalThis.isOverpowered = false;
            console.log("Aircraft properties set to normal.");
            ui.notification.show("Aircraft properties set to normal.");
            setTimeout(() => {
                document.querySelectorAll(".geofs-haring").forEach(el => el.remove());
            }, 3000);

        } else {
            applyOverpoweredProperties();
            globalThis.isOverpowered = true;
            console.log("Aircraft properties set to overpowered mode.");
            ui.notification.show("Aircraft properties set to overpowered mode.");
            setTimeout(() => {
                document.querySelectorAll(".geofs-haring").forEach(el => el.remove());
            }, 3000);

        }
    }

    document.addEventListener("keydown", function (event) {
    if (event.key.toLowerCase() === "q"  && !event.ctrlKey && !event.altKey && !event.metaKey) {
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
            globalThis.isOverpowered = false;
            lastAircraftID = currentAircraftID;
        }
    }, 500); // Check every 500ms
}

function monitorAutopilotOscillation() {
    let lastVS = 0;
    let lastFlipTime = 0;
    let flipCount = 0;

    const flipThreshold = 200;   //  VS change needed for "flip"
    const flipWindow = 1000;    // ms between flips to count as oscillation
    const releaseMargin = 10;   // knots below critical speed to restore normal PIDs

    let dampened = false;
    let criticalSpeed = null;

    setInterval(() => {
        try {
            const ap = geofs.autopilot;
            const VS = geofs.animation.values.verticalSpeed || 0;
            const speed = geofs.animation.values.kias || 0;
            const pitchPID = ap?.PIDs?.pitchAngle;
            if (!ap || !pitchPID) return;

            const apActive = ap.on;

            const vsChange = Math.abs(VS - lastVS);
            if (vsChange > flipThreshold) {
                const now = Date.now();
                if (now - lastFlipTime < flipWindow) {
                    const now = Date.now();
                    if (now - lastFlipTime < flipWindow) {
                        flipCount++;
                    } else {
                        flipCount = 1;
                    }
                    lastFlipTime = now;
                }
            }
            // When oscillation is detected while AP is on
            if (flipCount >= 2 && apActive && !dampened) {
                if (!originalValues.pitchPID) {
                    originalValues.pitchPID = {
                        kp: pitchPID._kp,
                        ki: pitchPID._ki,
                        kd: pitchPID._kd
                    };
                }

                criticalSpeed = speed;
                dampened = true;

                // Apply damping
                pitchPID._kp = 0.001;
                pitchPID._ki = 0.001;
                pitchPID._kd = 0.001;

                console.log(`[AP Dampener] Oscillation detected at ${speed.toFixed(0)} kts — PIDs reduced.`);
            }

            // Restore when below safe speed or AP off
            if (dampened && (!apActive || (criticalSpeed && speed < criticalSpeed - releaseMargin))) {
                const orig = originalValues.pitchPID;
                if (orig) {
                    pitchPID._kp = orig.kp;
                    pitchPID._ki = orig.ki;
                    pitchPID._kd = orig.kd;
                }

                dampened = false;
                criticalSpeed = null;
                flipCount = 0;
                console.log("[AP Dampener] Restored normal PIDs.");
            }

            lastVS = VS;
        } catch (e) {
            console.warn("Autopilot oscillation monitor error:", e);
        }
    }, 50);
}

const waitForGeoFS = setInterval(() => {
    if (typeof geofs !== "undefined" && geofs.aircraft && geofs.aircraft.instance) {
        clearInterval(waitForGeoFS);
        setTimeout(() => {
            toggleAircraftProperties();
            monitorAutopilotOscillation();
            console.log("GeoFS loaded, running addons…");
        }, 1000);
    }
}, 100);

