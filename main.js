function toggleAircraftProperties() {
    let isOverpowered = false;
    let originalValues = { thrust: {}, zeroThrustAltitude: null, zeroRPMAltitude: null };

    function applyOverpoweredProperties() {
        if (geofs && geofs.aircraft && geofs.aircraft.instance) {
            const aircraft = geofs.aircraft.instance;

            if (originalValues.zeroThrustAltitude === null && aircraft.definition && aircraft.definition.zeroThrustAltitude !== undefined) {
                originalValues.zeroThrustAltitude = aircraft.definition.zeroThrustAltitude;
            }

            if (originalValues.zeroRPMAltitude === null && aircraft.definition && aircraft.definition.zeroRPMAltitude !== undefined) {
                originalValues.zeroRPMAltitude = aircraft.definition.zeroRPMAltitude;
            }

            if (aircraft.definition) {
                if (aircraft.definition.zeroThrustAltitude !== undefined) {
                    aircraft.definition.zeroThrustAltitude = 300000;
                }
                if (aircraft.definition.zeroRPMAltitude !== undefined) {
                    aircraft.definition.zeroRPMAltitude = 300000;
                }
            }

            if (aircraft.parts) {
                for (let partName in aircraft.parts) {
                    let part = aircraft.parts[partName];
                    if (part && part.thrust !== undefined) {
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
        if (geofs && geofs.aircraft && geofs.aircraft.instance) {
            const aircraft = geofs.aircraft.instance;

            if (aircraft.definition && originalValues.zeroThrustAltitude !== null) {
                aircraft.definition.zeroThrustAltitude = originalValues.zeroThrustAltitude;
            }

            if (aircraft.definition && originalValues.zeroRPMAltitude !== null) {
                aircraft.definition.zeroRPMAltitude = originalValues.zeroRPMAltitude;
            }

            if (aircraft.parts) {
                for (let partName in originalValues.thrust) {
                    let part = aircraft.parts[partName];
                    if (part && part.thrust !== undefined) {
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
        if (event.key.toLowerCase() === "q") {
            toggleProperties();
        }
    });

    console.log("Press 'Q' to toggle aircraft properties between normal and overpowered.");
}

toggleAircraftProperties();
