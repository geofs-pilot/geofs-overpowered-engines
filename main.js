function toggleAircraftProperties() {
    globalThis.isOverpowered = false;
    let originalValues = { thrust: {}, zeroThrustAltitude: null, zeroRPMAltitude: null };
    let lastAircraftID = geofs?.aircraft?.instance?.aircraftRecord?.id || null;
    let mass = geofs.aircraft.instance.definition.mass;

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
                            afterBurnerThrust: part.afterBurnerThrust || null
                        };
                    }

                    let thrustValue, afterburnerValue;

                    if (mass < 10000) {
                        thrustValue = 30000;
                        afterburnerValue = 30000;
                    } else if (mass < 50000) {
                        thrustValue = 500000;
                        afterburnerValue = 500000;
                    } else if (mass < 100000) {
                        thrustValue = 600000;
                        afterburnerValue = 600000;
                    } else {
                        thrustValue = 900000;
                        afterburnerValue = 900000;
                    }

                    part.thrust = thrustValue;
                    if (part.afterBurnerThrust !== undefined) {
                        part.afterBurnerThrust = afterburnerValue;
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
        if (globalThis.isOverpowered) {
            applyNormalProperties();
            globalThis.isOverpowered = false;
            console.log("Aircraft properties set to normal.");
            ui.notification.show("Aircraft properties set to normal.");
        } else {
            applyOverpoweredProperties();
            globalThis.isOverpowered = true;
            console.log("Aircraft properties set to overpowered mode.");
            ui.notification.show("Aircraft properties set to overpowered mode.");
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

toggleAircraftProperties();

