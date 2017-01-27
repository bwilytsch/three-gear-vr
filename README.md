## Interface & Controls Experiment for WebVR

Sandbox for writing shaders, exploring new interaction patterns in VR, optimizing performance and workflow.

#### Supported devices:
- Desktop
- Mobile
- Cardboard
- GearVR
- HTC Vive


[demo](#) (soon)


#### ToDOs:
- [ ] Add Intro screen
- [ ] Pre-Loader for assets
- [ ] Add texture and shadows to the floor 3dof+
- [ ] All objects are Audio targets
- [ ] General cleanup/refactor
- [ ] Refactor webpack dev/production code
- [ ] Notification for controller not detected (GearVR + Vive)
- [X] Include basic GearVR Gamepad controller
- [X] Compass 2D/dekstop version with svg and css rotations
- [X] SVG/2D implementation is very shakey
- [X] Add Vive Controllers
- [X] Setup ControlsManager
- [X] Setup InterfaceManager aka Compass
- [X] Rethink Label 2D compass
- [X] Build event sniffer for not creating duplicates (would be resolved by making touch == crosshair controls).
- [X] Make TouchControls based on CrosshairControls like GearVRControls?
- [X] Move PixiJS texture to custom shader rather than using MeshBasicMaterial (Didn't work first try)
- [X] Create all labels beforehand and not during runtime.
- [X] Canvas texture drops FPS significantly. (replaced by custom shader)


#### Credits:
[ThreeJS](https://threejs.org), [PixiJS](http://www.pixijs.com/), [WebVR-Polyfill](https://github.com/googlevr/webvr-polyfill), [WebVR-Manager](https://github.com/borismus/webvr-boilerplate)