var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// THREEx.KeyboardState.js keep the current state of the keyboard.
// It is possible to query it at any time. No need of an event.
// This is particularly convenient in loop driven case, like in
// 3D demos or games.
//
// # Usage
//
// **Step 1**: Create the object
//
// ```var keyboard	= new THREEx.KeyboardState();```
//
// **Step 2**: Query the keyboard state
//
// This will return true if shift and A are pressed, false otherwise
//
// ```keyboard.pressed("shift+A")```
//
// **Step 3**: Stop listening to the keyboard
//
// ```keyboard.destroy()```
//
// NOTE: this library may be nice as standaline. independant from three.js
// - rename it keyboardForGame
//
// # Code
//
/** @namespace */
var THREEx;
(function (THREEx) {
    /**
     * - NOTE: it would be quite easy to push event-driven too
     *   - microevent.js for events handling
     *   - in this._onkeyChange, generate a string from the DOM event
     *   - use this as event name
    */
    var KeyboardState = (function () {
        function KeyboardState(domElement) {
            //this.domElement = domElement || document;
            // to store the current state
            //this.keyCodes = {};
            //this.modifiers = {};
            if (domElement === void 0) { domElement = document; }
            var _this = this;
            this.domElement = domElement;
            this.keyCodes = {};
            this.modifiers = {};
            this._onBlur = function () {
                for (var prop in _this.keyCodes) {
                    _this.keyCodes[prop] = false;
                }
                for (var prop in _this.modifiers) {
                    _this.modifiers[prop] = false;
                }
            };
            /**
             * to process the keyboard dom event
            */
            this._onKeyChange = function (event) {
                // log to debug
                //console.log("onKeyChange", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
                // update this.keyCodes
                var keyCode = event.keyCode;
                var pressed = event.type === "keydown" ? true : false;
                _this.keyCodes[keyCode] = pressed;
                // update this.modifiers
                _this.modifiers["shift"] = event.shiftKey;
                _this.modifiers["ctrl"] = event.ctrlKey;
                _this.modifiers["alt"] = event.altKey;
                _this.modifiers["meta"] = event.metaKey;
            };
            // create callback to bind/unbind keyboard events
            //var _this = this;
            //this._onKeyDown = function (event) { _this._onKeyChange(event) }
            //this._onKeyUp = function (event) { _this._onKeyChange(event) }
            // bind keyEvents
            this.domElement.addEventListener("keydown", this._onKeyChange, false);
            this.domElement.addEventListener("keyup", this._onKeyChange, false);
            // create callback to bind/unbind window blur event
            //this._onBlur = () => {
            //    for (var prop in this.keyCodes)
            //        this.keyCodes[prop] = false;
            //    for (var prop in this.modifiers)
            //        this.modifiers[prop] = false;
            //}
            // bind window blur
            window.addEventListener("blur", this._onBlur, false);
        }
        /**
         * To stop listening of the keyboard events
        */
        KeyboardState.prototype.destroy = function () {
            // unbind keyEvents
            this.domElement.removeEventListener("keydown", this._onKeyChange, false);
            this.domElement.removeEventListener("keyup", this._onKeyChange, false);
            // unbind window blur event
            window.removeEventListener("blur", this._onBlur, false);
        };
        /**
         * query keyboard state to know if a key is pressed of not
         *
         * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
         * @returns {Boolean} true if the key is pressed, false otherwise
        */
        KeyboardState.prototype.pressed = function (keyDesc) {
            var keys = keyDesc.split("+");
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var pressed = false;
                if (KeyboardState.MODIFIERS.indexOf(key) !== -1) {
                    pressed = this.modifiers[key];
                }
                else if (Object.keys(KeyboardState.ALIAS).indexOf(key) !== -1) {
                    pressed = this.keyCodes[KeyboardState.ALIAS[key]];
                }
                else {
                    pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)];
                }
                if (!pressed) {
                    return false;
                }
            }
            ;
            return true;
        };
        /**
         * return true if an event match a keyDesc
         * @param  {KeyboardEvent} event   keyboard event
         * @param  {String} keyDesc string description of the key
         * @return {Boolean}         true if the event match keyDesc, false otherwise
         */
        KeyboardState.prototype.eventMatches = function (event, keyDesc) {
            var aliases = KeyboardState.ALIAS;
            var aliasKeys = Object.keys(aliases);
            var keys = keyDesc.split("+");
            // log to debug
            // console.log("eventMatches", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var pressed = false;
                if (key === "shift") {
                    pressed = (event.shiftKey ? true : false);
                }
                else if (key === "ctrl") {
                    pressed = (event.ctrlKey ? true : false);
                }
                else if (key === "alt") {
                    pressed = (event.altKey ? true : false);
                }
                else if (key === "meta") {
                    pressed = (event.metaKey ? true : false);
                }
                else if (aliasKeys.indexOf(key) !== -1) {
                    pressed = (event.keyCode === aliases[key] ? true : false);
                }
                else if (event.keyCode === key.toUpperCase().charCodeAt(0)) {
                    pressed = true;
                }
                if (!pressed) {
                    return false;
                }
            }
            return true;
        };
        return KeyboardState;
    }());
    KeyboardState.MODIFIERS = ["shift", "ctrl", "alt", "meta"];
    KeyboardState.ALIAS = {
        "left": 37, "up": 38, "right": 39, "down": 40,
        "space": 32, "pageup": 33, "pagedown": 34, "tab": 9, "escape": 27,
    };
    THREEx.KeyboardState = KeyboardState;
})(THREEx || (THREEx = {}));
// This THREEx helper makes it easy to handle window resize.
// It will update renderer and camera when window is resized.
//
// # Usage
//
// **Step 1**: Start updating renderer and camera
//
// ```var windowResize = THREEx.WindowResize(aRenderer, aCamera)```
//    
// **Step 2**: Start updating renderer and camera
//
// ```windowResize.stop()```
// # Code
//
/** @namespace */
var THREEx;
(function (THREEx) {
    /**
     * Update renderer and camera when the window is resized
     *
     * @param {Object} renderer the renderer to update
     * @param {Object} Camera the camera to update
    */
    function WindowResize(renderer, camera) {
        var callback = function () {
            // notify the renderer of the size change
            renderer.setSize(window.innerWidth, window.innerHeight);
            // update the camera
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        // bind the resize event
        window.addEventListener('resize', callback, false);
        // return .stop() the function to stop watching window resize
        return {
            /**
             * Stop watching window resize
            */
            stop: function () {
                window.removeEventListener('resize', callback);
            }
        };
    }
    THREEx.WindowResize = WindowResize;
})(THREEx || (THREEx = {}));
//
// Applet3D�N���X
//
// �R�c�\����x�����邽�߂̃N���X
// ��ɂR�c���Q�c�ϊ��ƁA�L�[�X�L������e�C�x���g�Ǘ���s��
//
var Applet3D = (function () {
    // keyShoot: boolean;                     // �X�y�[�X�L�[�̏��h
    // keyLeft: boolean;                      // ���J�[�\���L�[�̏��
    // keyRight: boolean;                     // �E�J�[�\���L�[�̏��
    // keyUp: boolean;                        // ��J�[�\���L�[�̏��
    // keyDown: boolean;                      // ���J�[�\���L�[�̏��
    // keyBoost: boolean;                     // B�i�u�[�X�g�j�L�[�̏��
    // �R���X�g���N�^
    function Applet3D() {
        this.camerapos = new THREE.Vector3();
        this.width = 600;
        this.height = 400;
        this.sCenterX = 300;
        this.sCenterY = 200;
        try {
        }
        catch (e) {
        }
        this.bgInit();
    }
    Applet3D.prototype.setWidth = function (width) {
        this.width = width;
        this.sCenterX = width / 2;
    };
    Applet3D.prototype.getWidth = function () {
        return this.width;
    };
    Applet3D.prototype.setHeight = function (heihgt) {
        this.height = heihgt;
        this.sCenterY = heihgt / 2;
    };
    Applet3D.prototype.getHeight = function () {
        return this.height;
    };
    // �o�b�N�o�b�t�@�̏�����
    Applet3D.prototype.bgInit = function () {
    };
    // �o�b�N�o�b�t�@�̃N���A
    Applet3D.prototype.clear = function (context) {
        context.clearRect(0, 0, this.width, this.height);
    };
    // �R�c�isp�j���Q�c�icp�j�ϊ�
    // �ϊ��ɂ�Plane�I�u�W�F�N�g�̕ϊ��s���p���Ă���
    Applet3D.prototype.change3d = function (plane, sp, cp) {
        // ���_���W�ɕ��s�ړ���A�ϊ��s���|����
        var x = sp.x - this.camerapos.x;
        var y = sp.y - this.camerapos.y;
        var z = sp.z - this.camerapos.z;
        var x1 = x * plane.matrix.elements[0] + y * plane.matrix.elements[4] + z * plane.matrix.elements[8];
        var y1 = x * plane.matrix.elements[1] + y * plane.matrix.elements[5] + z * plane.matrix.elements[9];
        var z1 = x * plane.matrix.elements[2] + y * plane.matrix.elements[6] + z * plane.matrix.elements[10];
        if (y1 > 10) {
            // ���s���Ŋ����ăX�N���[�����W�ɕϊ�
            y1 /= 10;
            cp.x = x1 * 50 / y1 + this.sCenterX;
            cp.y = -z1 * 50 / y1 + this.sCenterY;
            cp.z = y1 * 10;
        }
        else {
            // �ϊ���̉��s���iy1�j��10�ȉ��Ȃ�N���b�v
            cp.x = -10000;
            cp.y = -10000;
            cp.z = 1;
        }
    };
    // �n�ʂƋ@�̕\���p�̃��C���\��
    Applet3D.prototype.drawSline = function (context, p0, p1) {
        if (p0.x > -10000 && p0.x < 30000 && p0.y > -10000 && p0.y < 30000 &&
            p1.x > -10000 && p1.x < 30000 && p1.y > -10000 && p1.y < 30000) {
            context.strokeStyle = "white";
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.stroke();
        }
    };
    // �e�ە\���p�̃��C���\��
    Applet3D.prototype.drawBlined = function (context, p0, p1) {
        if (p0.x > -1000 && p1.x > -1000) {
            // bGraphics.setColor(Color.yellow);
            context.strokeStyle = "yellow";
            // bGraphics.drawLine((int)p0.x, (int)p0.y, (int)p1.x, (int)p1.y);
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.stroke();
        }
    };
    // �e�ە\���p�̑������C���\��
    Applet3D.prototype.drawBline = function (context, p0, p1) {
        if (p0.x > -1000 && p1.x > -1000) {
            //bGraphics.setColor(Color.yellow);
            context.strokeStyle = "yellow";
            //bGraphics.drawLine(p0.x, (int)p0.y, (int)p1.x, (int)p1.y);
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.stroke();
        }
    };
    // �~�T�C�����p�̃��C���\��
    Applet3D.prototype.drawMline = function (context, p0, p1) {
        if (p0.x > -1000 && p1.x > -1000) {
            // bGraphics.setColor(Color.lightGray);
            context.strokeStyle = "lightgrey";
            // bGraphics.drawLine(p0.x, p0.y, p1.x, p1.y);
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.stroke();
        }
    };
    // �~�T�C���p�̃��C���\��
    Applet3D.prototype.drawAline = function (p0, p1) {
        if (p0.x > -1000 && p1.x > -1000) {
        }
    };
    // �|���S���\��
    Applet3D.prototype.drawPoly = function (context, p0, p1, p2) {
        this.drawSline(context, p0, p1);
        this.drawSline(context, p1, p2);
        this.drawSline(context, p2, p0);
    };
    // �����p�̉~�\��
    Applet3D.prototype.fillBarc = function (p) {
        if (p.x >= -100) {
            // �y���W�l�Ŕ��a��ς���
            var rr = (2000 / p.z) + 2;
            if (rr > 40)
                rr = 40;
        }
    };
    Applet3D.prototype.fillText = function (context, text, x, y) {
        context.font = "18px '�l�r �o�S�V�b�N'";
        context.fillStyle = "white";
        context.fillText(text, x, y);
    };
    Applet3D.prototype.drawLine = function (context, strokeStyle, x1, y1, x2, y2) {
        context.strokeStyle = strokeStyle;
        //�`�悷�邱�Ƃ�錾����
        context.beginPath();
        //�`���n�߁i�n�_�j����肷��
        context.moveTo(x1, y1);
        //�n�_����w��̍��W�܂Ő������
        context.lineTo(x2, y2);
        //����������������Ă���
        //context.lineTo(0, 100);
        //context.lineTo(51, 15);
        //�`���I������
        context.closePath();
        //��L�L�q�͒�`���ł���B���̖��߂Ő���`���B
        context.stroke();
    };
    return Applet3D;
}());
var PhysicsState = (function () {
    function PhysicsState() {
        this.position = new THREE.Vector3(); // 位置（ワールド座標系）
        this.velocity = new THREE.Vector3(); // 速度（ワールド座標系）
        this.rotation = new THREE.Euler(); //
    }
    return PhysicsState;
}());
//
// Wing
// ���N���X
//
// ���ɂ����G���W����\��
//
var Wing = (function (_super) {
    __extends(Wing, _super);
    // �R���X�g���N�^
    function Wing() {
        var _this = _super.call(this) || this;
        //        ���W�n
        //     Z
        //     ^  Y
        //     | /
        //     |/
        //     -------->X
        // �ϐ�
        _this.unitX = new THREE.Vector3(); // �����W�w�P�ʃx�N�g���i�@�̍��W�j
        _this.unitY = new THREE.Vector3(); // �����W�x�P�ʃx�N�g���i�@�̍��W�j
        _this.zVel = new THREE.Vector3(); // �����W�y�P�ʃx�N�g���i�@�̍��W�j
        _this.fVel = new THREE.Vector3(); // ���ɂ������Ă����
        return _this;
    }
    // ���v�Z��s��
    // fVel�Ɍv�Z���ʂ����܂�
    // ve�͋�C���x�Ano�͗�No.�i�}�p�v�Z�Ɏg�p�j�Aboost�̓G���W���u�[�X�g
    Wing.prototype.calc = function (plane, ve, no, boost) {
        var cd, ff;
        // �@�̂̑��x�Ɖ�]���A���̈ʒu���痃�ɂ����鑬�x����߂�i�O�όv�Z�j
        var vp = new THREE.Vector3();
        // vp.x = plane.localVelocity.x + this.position.y * plane.vaVel.z - this.position.z * plane.vaVel.y;
        // vp.y = plane.localVelocity.y + this.position.z * plane.vaVel.x - this.position.x * plane.vaVel.z;
        // vp.z = plane.localVelocity.z + this.position.x * plane.vaVel.y - this.position.y * plane.vaVel.x;
        // vp = plane.localVelocity + this.position.x �~ plane.vaVel;
        vp.crossVectors(this.position, plane.vaVel);
        vp.add(plane.localVelocity);
        // ���̂Ђ˂���ɁA��{���W�x�N�g�����]
        var sin = Math.sin(this.bAngle);
        var cos = Math.cos(this.bAngle);
        var qx = new THREE.Vector3();
        // qx.x = this.unitX.x * cos - this.zVel.x * sin;
        // qx.y = this.unitX.y * cos - this.zVel.y * sin;
        // qx.z = this.unitX.z * cos - this.zVel.z * sin;
        // qx = this.unitX * cos - this.zVel * sin;
        qx.addScaledVector(this.unitX, cos);
        qx.addScaledVector(this.zVel, -sin);
        var qy = new THREE.Vector3();
        //this.m_qy.set(this.yVel.x, this.yVel.y, this.yVel.z);
        qy.copy(this.unitY);
        var qz = new THREE.Vector3();
        qz.x = this.unitX.x * sin + this.zVel.x * cos;
        qz.y = this.unitX.y * sin + this.zVel.y * cos;
        qz.z = this.unitX.z * sin + this.zVel.z * cos;
        sin = Math.sin(this.aAngle);
        cos = Math.cos(this.aAngle);
        // this.m_wx.set(this.m_qx.x, this.m_qx.y, this.m_qx.z);
        var wx = new THREE.Vector3();
        wx.copy(qx);
        var wy = new THREE.Vector3();
        wy.x = qy.x * cos - qz.x * sin;
        wy.y = qy.y * cos - qz.y * sin;
        wy.z = qy.z * cos - qz.z * sin;
        var wz = new THREE.Vector3();
        wz.x = qy.x * sin + qz.x * cos;
        wz.y = qy.y * sin + qz.y * cos;
        wz.z = qy.z * sin + qz.z * cos;
        var t0 = 0;
        this.fVel.set(0, 0, 0);
        if (this.sVal > 0) {
            // ���v�Z
            // let vv = this.m_vp.abs();
            // �����x�̒P�ʃx�N�g������߂�(�@�̍��W)
            // this.m_ti.x = this.m_vp.x / vv;
            // this.m_ti.y = this.m_vp.y / vv;
            // this.m_ti.z = this.m_vp.z / vv;
            var ti = new THREE.Vector3();
            ti.copy(vp);
            ti.normalize();
            // �@�̍��W�̗����x�𗃍��W�n�ɕϊ�
            // let dx = wx.x * vp.x + wx.y * vp.y + wx.z * vp.z;
            var dx = wx.dot(vp);
            // let dy = wy.x * vp.x + wy.y * vp.y + wy.z * vp.z;
            var dy = wy.dot(vp);
            var dz = wz.x * vp.x + wz.y * vp.y + wz.z * vp.z;
            // �g�͕����̑��x��������߂�
            var rr = Math.sqrt(dx * dx + dy * dy);
            var vp2 = new THREE.Vector3();
            if (rr > 0.001) {
                vp2.x = (wx.x * dx + wy.x * dy) / rr;
                vp2.y = (wx.y * dx + wy.y * dy) / rr;
                vp2.z = (wx.z * dx + wy.z * dy) / rr;
            }
            else {
                vp2.x = wx.x * dx + wy.x * dy;
                vp2.y = wx.y * dx + wy.y * dy;
                vp2.z = wx.z * dx + wy.z * dy;
            }
            var ni = new THREE.Vector3();
            ni.x = wz.x * rr - vp2.x * dz;
            ni.y = wz.y * rr - vp2.y * dz;
            ni.z = wz.z * rr - vp2.z * dz;
            // vv = this.m_ni.abs();
            // this.m_ni.consInv(vv);
            var vv = ni.length();
            ni.normalize();
            // �}�p����߂�
            var at = -Math.atan(dz / dy);
            if (no === 0) {
                plane.aoa = at;
            }
            var cl = 0;
            if (Math.abs(at) < 0.4) {
                //  �g�͌W���ƍR�͌W����}�p���狁�߂�
                cl = at * 4;
                cd = (at * at + 0.05);
            }
            else {
                //  �}�p��0.4rad�𒴂��Ă����玸��
                cl = 0;
                cd = (0.4 * 0.4 + 0.05);
            }
            // �R�͂���߂�
            t0 = 0.5 * vv * vv * cd * ve * this.sVal;
            // �g�͂���߂�
            var n = 0.5 * rr * rr * cl * ve * this.sVal;
            this.fVel.x = n * ni.x - t0 * ti.x;
            this.fVel.y = n * ni.y - t0 * ti.y;
            this.fVel.z = n * ni.z - t0 * ti.z;
        }
        if (this.tVal > 0) {
            // ���͌v�Z
            // ���͂���߂�
            if (boost) {
                ff = ((5 * 10) / 0.9) * ve * 4.8 * this.tVal;
            }
            else {
                ff = (plane.power / 0.9) * ve * 4.8 * this.tVal;
            }
            // �n�ʂɋ߂��ꍇ�A�������̐��͂�グ��
            if (plane.height < 20)
                ff *= (1 + (20 - plane.height) / 40);
            // ���͂������
            // this.fVel.addCons(this.m_wy, ff);
            this.fVel.addScaledVector(wy, ff);
        }
        // this.forward.set(this.m_wy.x, this.m_wy.y, this.m_wy.z);
    };
    return Wing;
}(PhysicsState));
//
// bullet
// �e�ۃN���X
//
var Bullet = (function (_super) {
    __extends(Bullet, _super);
    // �R���X�g���N�^
    function Bullet(scene) {
        var _this = _super.call(this) || this;
        // �ϐ�
        _this.oldPosition = new THREE.Vector3(); // �P�X�e�b�v�O�̈ʒu
        _this.use = 0; // �g�p��ԁi0�Ŗ��g�p�j
        _this.bom = 0; // ������ԁi0�Ŗ����j
        var geometry = new THREE.SphereGeometry(5, 8, 8);
        var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        _this.sphere = new THREE.Mesh(geometry, material);
        _this.sphere.visible = false;
        scene.add(_this.sphere);
        return _this;
    }
    // �e�ۈړ��A�G�@�Ƃ̂����蔻��A�n�ʂƂ̓����蔻���s��
    // �e�۔��ˏ�����Jflight�N���X���ōs���Ă���
    Bullet.prototype.move = function (world, plane) {
        // �d�͉���
        this.velocity.z += Jflight.G * Jflight.DT;
        // ��O�̈ʒu��ۑ�
        this.oldPosition.set(this.position.x, this.position.y, this.position.z);
        // �ړ�
        // this.position.addCons(this.velocity, Jflight.DT);
        this.position.addScaledVector(this.velocity, Jflight.DT);
        this.use--;
        // �e�ۂ�ړ�������
        if (this.use > 0) {
            this.sphere.position.x = this.position.x;
            this.sphere.position.y = this.position.y;
            this.sphere.position.z = this.position.z;
            this.sphere.visible = true;
        }
        else {
            this.sphere.visible = false;
        }
        // �e�ۂ��������̏ꍇ�A���~�\��
        if (this.bom > 0) {
            // this.change3d(this.plane[0], bp.opVel, cp);
            // this.fillBarc(cp);
            this.bom--;
        }
        // �ڕW����܂��Ă���̂Ȃ�^�[�Q�b�g�Ƃ̓����蔻���s��
        // �ڕW�ȊO�Ƃ̓����蔻��͍s��Ȃ�
        if (plane.gunTarget > -1) {
            // �ڕW�����݂��Ă���ꍇ
            // �����ł̓����蔻����@�́A
            // ��O�̈ʒu�ƌ��݂̈ʒu�Ƃ̋�����
            // ��O�̈ʒu�ƖڕW�̋����A���݂̈ʒu�ƖڕW�̋����Ƃ̘a���r���邱�Ƃ�
            // �s���Ă���B�e�ۑ��x���������߁A�P�ɋ�������߂Ă������Ȃ��B
            // �_�ƒ����̕������ōĐڋߋ�������߂Ă�ǂ����A�ʓ|�������̂Ŏ蔲�� �B
            // ���݂̒e�ۂ̈ʒu�ƖڕW�Ƃ̍��x�N�g������߂�
            var a = new THREE.Vector3();
            // this.m_a.setMinus(<any>this.position, <any>world.plane[plane.gunTarget].position);
            a.subVectors(this.position, world.plane[plane.gunTarget].position);
            // ��O�̒e�ۂ̈ʒu�ƖڕW�Ƃ̍��x�N�g������߂�
            var b = new THREE.Vector3();
            // this.m_b.setMinus(<any>this.oldPosition, <any>world.plane[plane.gunTarget].position);
            b.subVectors(this.oldPosition, world.plane[plane.gunTarget].position);
            // ��O�̒e�ۂ̈ʒu�ƌ��݂̒e�ۂ̈ʒu�Ƃ̍��x�N�g������߂�
            //this.m_vv.setCons(<any>this.velocity, Jflight.DT);
            var v = new THREE.Vector3();
            v.copy(this.velocity);
            v.multiplyScalar(Jflight.DT);
            //let v0 = this.m_vv.abs();
            var v0 = v.length();
            // let l = this.m_a.abs() + this.m_b.abs();
            var l = a.length() + b.length();
            if (l < v0 * 1.05) {
                // ����
                this.bom = 1; // �����\���p�ɃZ�b�g
                this.use = 10; // �����ɂ͏����Ȃ��Œ��˔�΂�
                // ���݈ʒu�ƈ�O�̈ʒu�̒��Ԉʒu�����̑��x�����𑫂��Ē��˔�΂�
                // v.x = (a.x + b.x) / 2.0;
                // v.y = (a.y + b.y) / 2.0;
                // v.z = (a.z + b.z) / 2.0;
                v.addVectors(a, b);
                v.divideScalar(2);
                // l = this.m_vv.abs();
                // this.m_vv.consInv(l);
                v.normalize();
                // this.velocity.addCons(this.m_vv, v0 / 0.1);
                this.velocity.addScaledVector(v, v0 / 0.1);
                // this.velocity.cons(0.1);
                this.velocity.multiplyScalar(0.1);
            }
        }
        // �n�ʂƂ̓����蔻��
        var gh = world.gHeight(this.position.x, this.position.y);
        if (this.position.z < gh) {
            // �n�ʈȉ��Ȃ�A�����˂�����
            this.velocity.z = Math.abs(this.velocity.z);
            this.position.z = gh;
            this.velocity.x += (Math.random() - 0.5) * 50;
            this.velocity.y += (Math.random() - 0.5) * 50;
            this.velocity.x *= 0.5;
            this.velocity.y *= 0.5;
            this.velocity.z *= 0.1;
        }
    };
    return Bullet;
}(PhysicsState));
//
// missile
// �~�T�C���N���X
//
var Missile = (function (_super) {
    __extends(Missile, _super);
    function Missile(scene) {
        var _this = _super.call(this) || this;
        // �ϐ�
        _this.oldPositions = []; // �̂̈ʒu�i���̈ʒu�j
        _this.forward = new THREE.Vector3(); // �����i�P�ʃx�N�g���j
        _this.use = 0; // �g�p��ԁi0�Ŗ��g�p�j
        _this.bom = 0; // ������ԁi0�Ŗ����j
        _this.bomm = 0; // �j���ԁi0�Ŗ����j
        _this.spheres = [];
        for (var i = 0; i < Missile.MOMAX; i++) {
            _this.oldPositions.push(new THREE.Vector3());
        }
        // this.m_a0 = new CVector3();
        var geometries = [];
        for (var i = 0; i < Missile.MOMAX; ++i) {
            geometries.push(new THREE.SphereGeometry(5, 8, 8));
        }
        var materials = [];
        for (var i = 0; i < Missile.MOMAX; ++i) {
            materials.push(new THREE.MeshBasicMaterial({ color: 0xffffff }));
            materials[i].opacity = 0.5;
            materials[i].transparent = true;
        }
        for (var i = 0; i < Missile.MOMAX; ++i) {
            _this.spheres.push(new THREE.Mesh(geometries[i], materials[i]));
        }
        for (var i = 0; i < Missile.MOMAX; ++i) {
            _this.spheres[i].visible = false;
            scene.add(_this.spheres[i]);
        }
        _this.explosion = new THREE.Mesh(new THREE.SphereGeometry(50, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf0f0f0 }));
        _this.explosion.visible = false;
        scene.add(_this.explosion);
        return _this;
    }
    // �~�T�C���̃z�[�~���O����
    Missile.prototype.horming = function (world, _plane) {
        // ���b�NON����Ă��āA�c��X�e�b�v��85�ȉ��Ȃ�z�[�~���O����
        if (this.targetNo >= 0 && this.use < 100 - 15) {
            // �����̑��x����߂�
            var v = this.velocity.length();
            if (Math.abs(v) < 1) {
                v = 1;
            }
            // �ǔ��ڕW
            var tp = world.plane[this.targetNo];
            // �ǔ��ڕW�Ƃ̋�������߂�
            // this.m_a0.setMinus(<any>tp.position, <any>this.position);
            var a0 = new THREE.Vector3();
            a0.subVectors(tp.position, this.position);
            // let l = this.m_a0.abs();
            var l = a0.length();
            if (l < 0.001) {
                l = 0.001;
            }
            // �ǔ��ڕW�Ƃ̑��x������߂�
            // this.m_a0.setMinus(<any>tp.velocity, <any>this.velocity);
            a0.subVectors(tp.velocity, this.velocity);
            // let m = this.m_a0.abs();
            var m = a0.length();
            // �Փ˗\�z���Ԃ�C������ŋ��߂�
            var t0 = l / v * (1.0 - m / (800 + 1));
            // �Փ˗\�z���Ԃ�O����T�Ɋۂ߂�
            if (t0 < 0) {
                t0 = 0;
            }
            if (t0 > 5) {
                t0 = 5;
            }
            // �Փ˗\�z���Ԏ��̃^�[�Q�b�g�̈ʒu�Ǝ����̈ʒu�̍�����߂�
            a0.x = tp.position.x + tp.velocity.x * t0 - (this.position.x + this.velocity.x * t0);
            a0.y = tp.position.y + tp.velocity.y * t0 - (this.position.y + this.velocity.y * t0);
            a0.z = tp.position.z + tp.velocity.z * t0 - (this.position.z + this.velocity.z * t0);
            var tr = ((100 - 15) - this.use) * 0.02 + 0.5;
            if (tr > 0.1) {
                tr = 0.1;
            }
            if (tr < 1) {
                // ���˒���́A�h��ȋ@������Ȃ�
                // l = this.m_a0.abs();
                l = a0.length();
                // this.forward.addCons(this.m_a0, l * tr * 10);
                this.forward.addScaledVector(a0, l * tr * 10);
            }
            else {
                // �����łȂ��ꍇ�A�ǔ������փ~�T�C���@��������
                //this.forward.set(this.m_a0.x, this.m_a0.y, this.m_a0.z);
                this.forward.copy(a0);
            }
            // ������P�ʃx�N�g���ɕ␳
            //this.forward.consInv(this.forward.abs());
            this.forward.normalize();
        }
    };
    // �~�T�C�����[�^�[�v�Z
    Missile.prototype.calcMotor = function (_world, _plane) {
        // ���˒���̓��[�^�[OFF
        if (this.use < 100 - 5) {
            var aa = 1.0 / 20;
            var bb = 1 - aa;
            // ���݂̑��x�����ƌ���������������ĐV���ȑ��x�����Ƃ���
            var v = this.velocity.length();
            this.velocity.x = this.forward.x * v * aa + this.velocity.x * bb;
            this.velocity.y = this.forward.y * v * aa + this.velocity.y * bb;
            this.velocity.z = this.forward.z * v * aa + this.velocity.z * bb;
            // �~�T�C������
            // this.velocity.addCons(this.forward, 10.0);
            this.velocity.addScaledVector(this.forward, 10.0);
        }
    };
    // �~�T�C���ړ��A�G�@�Ƃ̂����蔻��A�n�ʂƂ̓����蔻���s��
    // �~�T�C�����ˏ�����Jflight�N���X���ōs���Ă���
    Missile.prototype.move = function (world, plane) {
        // �������Ȃ�J�E���^����
        if (this.bom > 0) {
            // �������
            this.count = 0;
            this.bom--;
            if (this.bom < 0) {
                this.use = 0;
            }
            return;
        }
        // �d�͉���
        this.velocity.z += Jflight.G * Jflight.DT;
        // �z�[�~���O�v�Z
        this.horming(world, plane);
        // �~�T�C�����[�^�[�v�Z
        this.calcMotor(world, plane);
        // �����O�o�b�t�@�Ɉʒu��ۑ�
        // this.oldPositions[this.use % Missile.MOMAX].set(this.position.x, this.position.y, this.position.z);
        this.oldPositions[this.use % Missile.MOMAX].copy(this.position);
        // �~�T�C���ړ�
        // this.position.addCons(this.velocity, Jflight.DT);
        this.position.addScaledVector(this.velocity, Jflight.DT);
        this.use--;
        // �^�[�Q�b�g�Ƃ̓����蔻��
        // ���b�N���Ă���ΏۂƂ̂ݓ����蔻�肷��
        if (this.targetNo >= 0) {
            // �ǔ��ڕW
            var tp = world.plane[this.targetNo];
            // �^�[�Q�b�g�Ƃ̋�������߂āA������x�ȉ��Ȃ瓖����i�ڐG�M�ǂ̂ݎg�p�j
            //this.m_a0.setMinus(<any>this.position, <any>tp.position);
            var a0 = new THREE.Vector3();
            a0.subVectors(this.position, tp.position);
            //if (this.m_a0.abs() < 10) {
            if (a0.length() < 10) {
                this.bom = 10;
            }
        }
        if (this.use >= 0) {
            // �~�T�C�����������łȂ���΁A�~�T�C���{�̂�\��
            if (this.bom <= 0) {
            }
            // �~�T�C���̉���\��
            // ���̍��W�̓����O�o�b�t�@�Ɋi�[����Ă���
            for (var i = 0; i < Missile.MOMAX; ++i) {
                this.spheres[i].visible = false;
            }
            var k = (this.use + Missile.MOMAX + 1) % Missile.MOMAX;
            // this.change3d(this.plane[0], ap.opVel[k], dm);
            for (var m = 0; m < this.count; m++) {
                // this.change3d(this.plane[0], ap.opVel[k], cp);
                // this.drawMline(context, dm, cp);
                this.spheres[k].position.x = this.oldPositions[k].x;
                this.spheres[k].position.y = this.oldPositions[k].y;
                this.spheres[k].position.z = this.oldPositions[k].z;
                this.spheres[k].visible = true;
                k = (k + Missile.MOMAX + 1) % Missile.MOMAX;
            }
        }
        // �~�T�C�����������̏ꍇ�A���~�\��
        this.explosion.visible = false;
        if (this.bom > 0) {
            // this.explosion.position.x = this.position.x;
            // this.explosion.position.y = this.position.y;
            // this.explosion.position.z = this.position.z;
            this.explosion.position.copy(this.position);
            this.explosion.visible = true;
        }
        // �n�ʂƂ̓����蔻��
        var gh = world.gHeight(this.position.x, this.position.y);
        if (this.position.z < gh) {
            this.bom = 10;
            this.position.z = gh + 3;
        }
        // �����O�o�b�t�@���i���̒����j��ݒ�
        if (this.count < Missile.MOMAX) {
            this.count++;
        }
    };
    return Missile;
}(PhysicsState));
// �萔
Missile.MOMAX = 50; // ���̒����̍ő�l
///<reference path="./Physics/PhysicsState.ts" />
///<reference path="Wing.ts" />
///<reference path="Bullet.ts" />
///<reference path="Missile.ts" />
//
// Plane
// �@�̃N���X
//
// �e�e�ۂ�~�T�C���𓮂����Ă���̂���̃N���X
//
var Plane = (function (_super) {
    __extends(Plane, _super);
    // �R���X�g���N�^
    function Plane(scene) {
        var _this = _super.call(this) || this;
        _this.matrix = new THREE.Matrix4();
        _this.wings = []; // �e��(0,1-�嗃,2-��������,3-��������,4,5-�G���W��)
        // public position = new CVector3();    // �@�̈ʒu�i���[���h���W�n�j
        // public vpVel = new CVector3();   // �@�̑��x�i���[���h���W�n�j
        // public aVel = new THREE.Euler();    // �@�̌����i�I�C���[�p�j
        _this.localVelocity = new THREE.Vector3(); // �@�̑��x�i�@�̍��W�n�j
        _this.gVel = new THREE.Vector3(); // �@�̉����x�i���[���h���W�n�j
        _this.vaVel = new THREE.Vector3(); // �@�̉�]���x�i�I�C���[�p�j
        _this.gcVel = new THREE.Vector3(); // �e�ۂ̏����\�z�ʒu
        _this.iMass = new THREE.Vector3(); // �@�̊e���̊������[�����g
        // ���c�n
        _this.stickPos = new THREE.Vector3(); // ���c�n�ʒu�ix,y-�X�e�B�b�N,z-�y�_���j
        _this.stickVel = new THREE.Vector3(); // ���c�n�ω���
        _this.stickR = 0.1; // ���c�n�̊��x (R-�Z���^�[�ւ̌�����)
        _this.stickA = 0.05; // ���c�n�̊��x�iA-�ω����j
        // �@�e�n
        _this.bullets = []; // �e�e�ۃI�u�W�F�N�g
        // �~�T�C���n
        _this.aam = []; // �e�~�T�C���I�u�W�F�N�g
        for (var i = 0; i < Plane.BMAX; i++) {
            _this.bullets.push(new Bullet(scene));
        }
        for (var i = 0; i < Plane.MMMAX; i++) {
            _this.aam.push(new Missile(scene));
        }
        for (var i = 0; i < Plane.WMAX; i++) {
            _this.wings.push(new Wing());
        }
        _this.aamTarget = new Array(Plane.MMMAX);
        _this.posInit();
        var material = new THREE.LineBasicMaterial({ color: 0xffffff });
        var geometry = new THREE.Geometry();
        for (var _i = 0, _a = Jflight.obj; _i < _a.length; _i++) {
            var vertices = _a[_i];
            geometry.vertices.push(vertices[0].clone());
            geometry.vertices.push(vertices[1].clone());
            geometry.vertices.push(vertices[2].clone());
        }
        _this.line = new THREE.Line(geometry, material);
        scene.add(_this.line);
        return _this;
    }
    // �e�ϐ������������
    Plane.prototype.posInit = function () {
        this.position.x = (Math.random() - 0.5) * 1000 - 8000;
        this.position.y = (Math.random() - 0.5) * 1000 - 1100;
        this.position.z = 5000;
        this.gHeight = 0;
        this.height = 5000;
        this.rotation.set(0, 0, Math.PI / 2);
        this.velocity.x = 200.0;
        this.velocity.y = 0.0;
        this.velocity.z = 0.0;
        this.gVel.set(0, 0, 0);
        this.vaVel.set(0, 0, 0);
        this.localVelocity.set(0, 0, 0);
        this.power = 5;
        this.throttle = 5;
        this.heatWait = false;
        this.gunTemp = 0;
        this.gcVel.set(this.position.x, this.position.y, this.position.z);
        this.target = -2;
        this.onGround = false;
        this.gunX = 0;
        this.gunY = 100;
        this.gunVx = 0;
        this.gunVy = 0;
        this.boost = false;
        this.aoa = 0;
        this.stickPos.set(0, 0, 0);
        this.stickVel.set(0, 0, 0);
        var wa = 45 * Math.PI / 180;
        var wa2 = 0 * Math.PI / 180;
        // �e���̈ʒu�ƌ�����Z�b�g
        //  �E��???
        this.wings[0].position.set(3, 0.1, 0);
        this.wings[0].unitX.set(Math.cos(wa), -Math.sin(wa), Math.sin(wa2));
        this.wings[0].unitY.set(Math.sin(wa), Math.cos(wa), 0);
        this.wings[0].zVel.set(0, 0, 1);
        // �@����???
        this.wings[1].position.set(-3, 0.1, 0);
        this.wings[1].unitX.set(Math.cos(wa), Math.sin(wa), -Math.sin(wa2));
        this.wings[1].unitY.set(-Math.sin(wa), Math.cos(wa), 0);
        this.wings[1].zVel.set(0, 0, 1);
        // ��������
        this.wings[2].position.set(0, -10, 2);
        this.wings[2].unitX.set(1, 0, 0);
        this.wings[2].unitY.set(0, 1, 0);
        this.wings[2].zVel.set(0, 0, 1);
        // ��������
        this.wings[3].position.set(0, -10, 0);
        this.wings[3].unitX.set(0, 0, 1);
        this.wings[3].unitY.set(0, 1, 0);
        this.wings[3].zVel.set(1, 0, 0);
        // �E�G���W��
        this.wings[4].position.set(5, 0, 0);
        this.wings[4].unitX.set(1, 0, 0);
        this.wings[4].unitY.set(0, 1, 0);
        this.wings[4].zVel.set(0, 0, 1);
        // ���G���W��
        this.wings[5].position.set(-5, 0, 0);
        this.wings[5].unitX.set(1, 0, 0);
        this.wings[5].unitY.set(0, 1, 0);
        this.wings[5].zVel.set(0, 0, 1);
        // �e���̎��ʂ�Z�b�g
        this.wings[0].mass = 400 / 2;
        this.wings[1].mass = 400 / 2;
        this.wings[2].mass = 50;
        this.wings[3].mass = 50;
        this.wings[4].mass = 300;
        this.wings[5].mass = 300;
        // �e���̖ʐς�Z�b�g
        this.wings[0].sVal = 60 / 2;
        this.wings[1].sVal = 60 / 2;
        this.wings[2].sVal = 2;
        this.wings[3].sVal = 2;
        this.wings[4].sVal = 0;
        this.wings[5].sVal = 0;
        // �G���W���̐��͂�Z�b�g
        this.wings[0].tVal = 0.1;
        this.wings[1].tVal = 0.1;
        this.wings[2].tVal = 0.1;
        this.wings[3].tVal = 0.1;
        this.wings[4].tVal = 1000;
        this.wings[5].tVal = 1000;
        // �����ʂƊ������[�����g����߂Ă���
        this.mass = 0;
        this.iMass.set(1000, 1000, 4000);
        var m_i = 1;
        for (var _i = 0, _a = this.wings; _i < _a.length; _i++) {
            var wing = _a[_i];
            this.mass += wing.mass;
            wing.aAngle = 0;
            wing.bAngle = 0;
            // wing.forward.set(0, 0, 1);
            this.iMass.x += wing.mass * (Math.abs(wing.position.x) + 1) * m_i * m_i;
            this.iMass.y += wing.mass * (Math.abs(wing.position.y) + 1) * m_i * m_i;
            this.iMass.z += wing.mass * (Math.abs(wing.position.z) + 1) * m_i * m_i;
        }
    };
    // �@�̂̃��[�J�����W�����[���h���W�ϊ��s�����߂�
    Plane.prototype.checkTrans = function () {
        var x = this.rotation.x;
        var y = this.rotation.y;
        var z = this.rotation.z;
        this.sina = Math.sin(x);
        this.cosa = Math.cos(x);
        if (this.cosa < 1e-9 && this.cosa > 0) {
            this.cosa = 1e-9;
        }
        if (this.cosa > -1e-9 && this.cosa < 0) {
            this.cosa = -1e-9;
        }
        this.sinb = Math.sin(y);
        this.cosb = Math.cos(y);
        this.sinc = Math.sin(z);
        this.cosc = Math.cos(z);
        // �s�b�`�i�@��̏㉺�j�����[���i���E�̌X���j�����[(�n�ʐ�������)
        var a = new THREE.Euler(x, -y, z, "YXZ");
        this.matrix.makeRotationFromEuler(a);
    };
    // ���[���h���W��@�̍��W�֕ϊ�����i�P���ϊ��̂݁j
    Plane.prototype.change_w2l = function (pw, pl) {
        pl.x = pw.x * this.matrix.elements[0] + pw.y * this.matrix.elements[4] + pw.z * this.matrix.elements[8];
        pl.y = pw.x * this.matrix.elements[1] + pw.y * this.matrix.elements[5] + pw.z * this.matrix.elements[9];
        pl.z = pw.x * this.matrix.elements[2] + pw.y * this.matrix.elements[6] + pw.z * this.matrix.elements[10];
    };
    // �@�̍��W����[���h���W�֕ϊ�����i�P���ϊ��̂݁j
    Plane.prototype.change_l2w = function (pl, pw) {
        pw.x = pl.x * this.matrix.elements[0] + pl.y * this.matrix.elements[1] + pl.z * this.matrix.elements[2];
        pw.y = pl.x * this.matrix.elements[4] + pl.y * this.matrix.elements[5] + pl.z * this.matrix.elements[6];
        pw.z = pl.x * this.matrix.elements[8] + pl.y * this.matrix.elements[9] + pl.z * this.matrix.elements[10];
    };
    // �@�e��~�T�C���̃��b�N����
    Plane.prototype.lockCheck = function (world) {
        var a = new THREE.Vector3();
        var b = new THREE.Vector3();
        var nno = new Array(Plane.MMMAX); // �@��No.
        var dis = new Array(Plane.MMMAX); // �@�̂Ǝ��@�Ƃ̋���
        for (var m = 0; m < Plane.MMMAX; m++) {
            dis[m] = 1e30;
            nno[m] = -1;
        }
        for (var m = 0; m < Jflight.PMAX; m++) {
            // �ڕW�����݂��Ă���΃��b�N���X�g�ɒǉ�
            if (m !== this.no && world.plane[m].use) {
                // �ڕW�Ƃ̋�������߂�
                //a.setMinus(<any>this.position, <any>world.plane[m].position);
                a.subVectors(this.position, world.plane[m].position);
                //let near_dis = a.abs2();
                var near_dis = a.lengthSq();
                if (near_dis < 1e8) {
                    // �ڕW�Ƃ̈ʒu�֌W��@�̍��W�n�ɕϊ�
                    this.change_w2l(a, b);
                    // ����T�[�N����Ȃ烍�b�N
                    if (b.y <= 0 && Math.sqrt(b.x * b.x + b.z * b.z) < -b.y * 0.24) {
                        // ���Ƀ��b�N����Ă���̂Ȃ�A���̃��b�N�Ƌ߂����ɒu��������
                        for (var m1 = 0; m1 < Plane.MMMAX; m1++) {
                            if (near_dis < dis[m1]) {
                                for (var m2 = Plane.MMMAX - 1; m2 > m1; m2--) {
                                    dis[m2] = dis[m2 - 1];
                                    nno[m2] = nno[m2 - 1];
                                }
                                dis[m1] = near_dis;
                                nno[m1] = m;
                                break;
                            }
                        }
                    }
                }
            }
        }
        // ���b�N�ڕW��������Ȃ��ꍇ�A��ԋ߂��ڕW�Ƀ��b�N
        for (var m1 = 1; m1 < 4; m1++) {
            if (nno[m1] < 0) {
                nno[m1] = nno[0];
                dis[m1] = dis[0];
            }
        }
        // �S�ȍ~�̃~�T�C���́A����|�b�h�̃~�T�C���ɍ��킹��
        for (var m1 = 4; m1 < Plane.MMMAX; m1++) {
            nno[m1] = nno[m1 % 4];
            dis[m1] = dis[m1 % 4];
        }
        for (var m1 = 0; m1 < Plane.MMMAX; m1++) {
            this.aamTarget[m1] = nno[m1];
        }
        // �@�e�̖ڕW�i��ڕW�j�́A�ł�߂��G�@�ɃZ�b�g
        this.gunTarget = nno[0];
        this.targetDis = Math.sqrt(dis[0]);
    };
    // �@�̂𓮂���
    // ���@�̒e�ۂȂǂ�ړ�
    Plane.prototype.move = function (world, autof) {
        this.checkTrans(); // ���W�ϊ��p�̍s��Čv�Z
        this.lockCheck(world); // �~�T�C�����b�N����
        if (this.no === 0 && !autof) {
            this.keyScan(world);
        }
        else {
            this.autoFlight(world); // �������c
        }
        this.moveCalc(world);
        this.moveBullet(world);
        this.moveAam(world);
    };
    // �L�[��Ԃ��ƂɁA�X�e�B�b�N��g���K�[��Z�b�g
    // ���ۂ̃L�[�X�L������������Ă���̂́AApplet3D�N���X
    Plane.prototype.keyScan = function (world) {
        this.stickVel.set(0, 0, 0);
        this.boost = false;
        this.gunShoot = keyboard.pressed("space"); // world.keyShoot;
        this.aamShoot = keyboard.pressed("space"); // world.keyShoot;
        if (keyboard.pressed("b")) {
            this.boost = true;
        }
        // �X�e�B�b�N��}���ɓ������Ƃ܂����̂ŁA
        // �X�e�B�b�N���g�Ɋ�����������Ċ��炩�ɓ������Ă���B
        if (keyboard.pressed("up")) {
            this.stickVel.x = 1;
        }
        if (keyboard.pressed("down")) {
            this.stickVel.x = -1;
        }
        if (keyboard.pressed("left")) {
            this.stickVel.y = -1;
        }
        if (keyboard.pressed("right")) {
            this.stickVel.y = 1;
        }
        if (this.stickPos.z > 1) {
            this.stickPos.z = 1;
        }
        if (this.stickPos.z < -1) {
            this.stickPos.z = -1;
        }
        // �}�E�X����
        if (world.isMouseMove) {
            var dx = this.stickPos.x - Jflight.mouseY;
            var dy = this.stickPos.y + Jflight.mouseX;
            this.stickVel.x = dx;
            this.stickVel.y = dy;
        }
        // this.stickPos.addCons(this.stickVel, this.stickA);
        this.stickPos.addScaledVector(this.stickVel, this.stickA);
        // this.stickPos.subCons(this.stickPos, this.stickR);
        this.stickPos.addScaledVector(this.stickPos, -this.stickR);
        // �X�e�B�b�N�ʒu������P�ȓ�Ɋۂ߂Ă���
        var r = Math.sqrt(this.stickPos.x * this.stickPos.x + this.stickPos.y * this.stickPos.y);
        if (r > 1) {
            this.stickPos.x /= r;
            this.stickPos.y /= r;
        }
    };
    // �@�̌v�Z
    Plane.prototype.moveCalc = function (world) {
        var ve;
        var dm = new THREE.Vector3();
        // ��ڕW�̌������̈ʒu����߂Ă����i�@�e�̒ǔ��ŗp����j
        this.targetSx = -1000;
        this.targetSy = 0;
        if (this.gunTarget >= 0 && world.plane[this.gunTarget].use) {
            // ��ڕW�̍��W��X�N���[�����W�ɕϊ�
            world.change3d(this, world.plane[this.gunTarget].position, dm);
            // �X�N���[����Ȃ�
            if (dm.x > 0 && dm.x < world.getWidth() && dm.y > 0 && dm.y < world.getHeight()) {
                this.targetSx = dm.x;
                this.targetSy = dm.y;
            }
        }
        // ���@�̈ʒu����A�n�ʂ̍�������߁A���x����߂�
        this.gHeight = world.gHeight(this.position.x, this.position.y);
        this.height = this.position.z - this.gHeight;
        // ��C���x�̌v�Z
        if (this.position.z < 5000) {
            ve = 0.12492 - 0.000008 * this.position.z;
        }
        else {
            ve = (0.12492 - 0.04) - 0.000002 * (this.position.z - 5000);
        }
        if (ve < 0) {
            ve = 0;
        }
        // �e���𑀏c�n�ɍ��킹�ĂЂ˂��Ă���
        this.wings[0].aAngle = -this.stickPos.y * 1.5 / 180 * Math.PI;
        this.wings[0].bAngle = 0;
        this.wings[1].aAngle = this.stickPos.y * 1.5 / 180 * Math.PI;
        this.wings[1].bAngle = 0;
        this.wings[2].aAngle = -this.stickPos.x * 6 / 180 * Math.PI;
        this.wings[2].bAngle = 0;
        this.wings[3].aAngle = this.stickPos.z * 6 / 180 * Math.PI;
        this.wings[3].bAngle = 0;
        this.wings[4].aAngle = 0;
        this.wings[4].bAngle = 0;
        this.wings[5].aAngle = 0;
        this.wings[5].bAngle = 0;
        this.change_w2l(this.velocity, this.localVelocity);
        this.onGround = false;
        if (this.height < 5) {
            this.onGround = true;
        }
        // af���@�̂ɂ������
        // am���@�̂ɂ����郂�[�����g
        var af = new THREE.Vector3(); //new CVector3();
        var am = new THREE.Vector3(); //new CVector3();
        // af.set(0, 0, 0);
        // am.set(0, 0, 0);
        // �e���ɓ����͂ƃ��[�����g��v�Z
        this.aoa = 0;
        var i = 0;
        var v = new THREE.Vector3();
        for (var _i = 0, _a = this.wings; _i < _a.length; _i++) {
            var wing = _a[_i];
            wing.calc(this, ve, i, this.boost);
            ++i;
            // ��
            af.x += (wing.fVel.x * this.matrix.elements[0] + wing.fVel.y * this.matrix.elements[1] + wing.fVel.z * this.matrix.elements[2]);
            af.y += (wing.fVel.x * this.matrix.elements[4] + wing.fVel.y * this.matrix.elements[5] + wing.fVel.z * this.matrix.elements[6]);
            af.z += (wing.fVel.x * this.matrix.elements[8] + wing.fVel.y * this.matrix.elements[9] + wing.fVel.z * this.matrix.elements[10]) + wing.mass * Jflight.G;
            // ���[�����g�i�͂Ɨ��ʒu�Ƃ̊O�ρj
            // am.x -= (wing.pVel.y * wing.fVel.z - wing.pVel.z * wing.fVel.y);
            // am.y -= (wing.pVel.z * wing.fVel.x - wing.pVel.x * wing.fVel.z);
            // am.z -= (wing.pVel.x * wing.fVel.y - wing.pVel.y * wing.fVel.x);
            // v = position �~ velocity
            // am -= v;
            v.crossVectors(wing.position, wing.fVel);
            am.sub(v);
        }
        // �p�x�ω���ϕ�
        this.vaVel.x += am.x / this.iMass.x * Jflight.DT;
        this.vaVel.y += am.y / this.iMass.y * Jflight.DT;
        this.vaVel.z += am.z / this.iMass.z * Jflight.DT;
        //let rotX = (this.vaVel.x * this.cosb + this.vaVel.z * this.sinb) * Jflight.DT;
        //let rotY = (this.vaVel.y + (this.vaVel.x * this.sinb - this.vaVel.z * this.cosb) * this.sina / this.cosa) * Jflight.DT;
        //let rotZ = (-this.vaVel.x * this.sinb + this.vaVel.z * this.cosb) / this.cosa * Jflight.DT;
        this.rotation.x += (this.vaVel.x * this.cosb + this.vaVel.z * this.sinb) * Jflight.DT;
        this.rotation.y += (this.vaVel.y + (this.vaVel.x * this.sinb - this.vaVel.z * this.cosb) * this.sina / this.cosa) * Jflight.DT;
        this.rotation.z += (-this.vaVel.x * this.sinb + this.vaVel.z * this.cosb) / this.cosa * Jflight.DT;
        // �@�̂̊p�x����͈͂Ɋۂ߂Ă���
        for (var q = 0; q < 3 && this.rotation.x >= Math.PI / 2; q++) {
            this.rotation.x = Math.PI - this.rotation.x;
            this.rotation.y += Math.PI;
            this.rotation.z += Math.PI;
        }
        for (var q = 0; q < 3 && this.rotation.x < -Math.PI / 2; q++) {
            this.rotation.x = -Math.PI - this.rotation.x;
            this.rotation.y += Math.PI;
            this.rotation.z += Math.PI;
        }
        for (var q = 0; q < 3 && this.rotation.y >= Math.PI; q++) {
            this.rotation.y -= Math.PI * 2;
        }
        for (var q = 0; q < 3 && this.rotation.y < -Math.PI; q++) {
            this.rotation.y += Math.PI * 2;
        }
        for (var q = 0; q < 3 && this.rotation.z >= Math.PI * 2; q++) {
            this.rotation.z -= Math.PI * 2;
        }
        for (var q = 0; q < 3 && this.rotation.z < 0; q++) {
            this.rotation.z += Math.PI * 2;
        }
        // �����x�����
        // this.gVel.setConsInv(af, this.mass);
        this.gVel.copy(af);
        this.gVel.multiplyScalar(1 / this.mass);
        // �@�̂Ŕ��������R��[���I�ɐ���
        var _v = new THREE.Vector3(); //new CVector3()
        _v.copy(this.velocity);
        _v.normalize();
        this.velocity.x -= this.velocity.x * this.velocity.x * 0.00002 * _v.x;
        this.velocity.y -= this.velocity.y * this.velocity.y * 0.00002 * _v.y;
        this.velocity.z -= this.velocity.z * this.velocity.z * 0.00002 * _v.z;
        // �n�ʂ̌X������
        world.gGrad(this.position.x, this.position.y, dm);
        if (this.onGround) {
            this.gVel.x -= dm.x * 10;
            this.gVel.y -= dm.y * 10;
            var vz = dm.x * this.velocity.x + dm.y * this.velocity.y;
            if (this.velocity.z < vz) {
                this.velocity.z = vz;
            }
        }
        // �u�[�X�g���ɂ́A�@�̂�U��������
        if (this.boost) {
            this.gVel.x += (Math.random() - 0.5) * 5;
            this.gVel.y += (Math.random() - 0.5) * 5;
            this.gVel.z += (Math.random() - 0.5) * 5;
        }
        // �@�̂̈ʒu��ϕ����ċ��߂�
        // this.velocity.addCons(this.gVel, Jflight.DT);
        this.velocity.addScaledVector(this.gVel, Jflight.DT);
        // this.position.addCons(this.velocity, Jflight.DT);
        this.position.addScaledVector(this.velocity, Jflight.DT);
        // �O�̂��߁A�n�ʂɂ߂荞�񂾂��ǂ����`�F�b�N
        if (this.height < 2) {
            this.position.z = this.gHeight + 2;
            this.height = 2;
            this.velocity.z *= -0.1;
        }
        // �n�ʂɂ�����x�ȏ�̑��x���A�����ȑ̐��ŐڐG�����ꍇ�A�@�̂������
        if (this.height < 5 && (Math.abs(this.velocity.z) > 50 || Math.abs(this.rotation.y) > 20 * Math.PI / 180 || this.rotation.x > 10 * Math.PI / 180)) {
            this.posInit();
        }
        //
        this.line.setRotationFromMatrix(this.matrix);
    };
    // �������c
    Plane.prototype.autoFlight = function (world) {
        var m, mm;
        this.gunShoot = false;
        this.aamShoot = false;
        if (this.target < 0 || !world.plane[this.target].use) {
            return;
        }
        this.power = 4;
        this.throttle = this.power;
        this.stickPos.z = 0;
        if (this.level < 0) {
            this.level = 0;
        }
        var dm_p = new THREE.Vector3();
        var dm_a = new THREE.Vector3();
        // �ڕW�Ǝ��@�̈ʒu�֌W����߁A�@�̍��W�ɕϊ����Ă���
        //dm_p.setMinus(<any>this.position, <any>world.plane[this.target].position);
        dm_p.subVectors(this.position, world.plane[this.target].position);
        this.change_w2l(dm_p, dm_a);
        // mm�́A�X�e�B�b�N�̈ړ����E��
        if (this.level >= 20) {
            mm = 1;
        }
        else {
            mm = (this.level + 1) * 0.05;
        }
        this.stickVel.x = 0;
        this.stickVel.y = 0;
        m = Math.sqrt(dm_a.x * dm_a.x + dm_a.z * dm_a.z);
        // �X���b�g���̈ʒu�́A�ڕW�ɂ��킹��
        if (this.level > 8 && this.gunTime < 1) {
            this.power = world.plane[this.target].power;
        }
        else {
            this.power = 9;
        }
        // �ڕW������Ɍ�����ꍇ�A�X�e�B�b�N�����
        if (dm_a.z < 0) {
            this.stickVel.x = dm_a.z / m * mm;
        }
        // �ڕW�̍��E�������ʒu�ɍ��킹�āA�X�e�B�b�N����E�ɓ�����
        this.stickVel.y = -dm_a.x / m * mm * 0.4;
        if (this.stickVel.y > 1) {
            this.stickVel.y = 1;
        }
        if (this.stickVel.y < -1) {
            this.stickVel.y = -1;
        }
        // �X�e�B�b�N�̊�������
        this.stickPos.x += this.stickVel.x;
        this.stickPos.y += this.stickVel.y;
        if (this.stickPos.x > 1) {
            this.stickPos.x = 1;
        }
        if (this.stickPos.x < -1) {
            this.stickPos.x = -1;
        }
        if (this.stickPos.y > 1) {
            this.stickPos.y = 1;
        }
        if (this.stickPos.y < -1) {
            this.stickPos.y = -1;
        }
        // �@�̍��x���Ⴂ���A8�b�ȓ�ɒn�ʂɂԂ��肻���ȏꍇ�A��Ɍ�����
        if (this.height < 1000 || this.height + this.velocity.z * 8 < 0) {
            this.stickPos.y = -this.rotation.y;
            if (Math.abs(this.rotation.y) < Math.PI / 2) {
                this.stickPos.x = -1;
            }
            else {
                this.stickPos.x = 0;
            }
        }
        // �X�e�B�b�N�ʒu��P�ȓ�Ɋۂ߂Ă���
        m = Math.sqrt(this.stickPos.x * this.stickPos.x + this.stickPos.y * this.stickPos.y);
        if (m > mm) {
            this.stickPos.x *= mm / m;
            this.stickPos.y *= mm / m;
        }
        // ��ڕW�Ƃ��đI�΂�Ă���̂Ȃ�A�@�e�����
        if (this.gunTarget === this.target && this.gunTime < 1) {
            // �@�e���I�[�o�[�q�[�g���Ă���ꍇ�A���x��������܂ő҂�
            if (!this.heatWait && this.gunTemp < Plane.MAXT - 1) {
                this.gunShoot = true;
            }
            else {
                this.heatWait = true;
            }
        }
        if (this.gunTemp < 2) {
            this.heatWait = false;
        }
        // ��ڕW�Ƃ��đI�΂�Ă���̂Ȃ�A�~�T�C�������
        if (this.gunTarget === this.target) {
            this.aamShoot = true;
        }
        // �����������ȏꍇ�A�X�e�B�b�N�𗣂�
        if (Math.abs(this.aoa) > 0.35) {
            this.stickPos.x = 0;
        }
    };
    // �@�e�̒e�ۈړ��Ɣ��ˏ���
    Plane.prototype.moveBullet = function (world) {
        // let aa;
        var sc = new THREE.Vector3();
        var a = new THREE.Vector3();
        var b = new THREE.Vector3();
        var c = new THREE.Vector3();
        var dm = new THREE.Vector3();
        var oi = new THREE.Vector3();
        var ni = new THREE.Vector3();
        // �e�ۂ̏������x����߂Ă���
        dm.set(this.gunX * 400 / 200, 400, this.gunY * 400 / 200);
        this.change_l2w(dm, oi);
        oi.add(this.velocity);
        this.gunTime = 1.0;
        // �e�ۂ̏����ʒu����߂Ă���
        dm.set(4 * 2, 10.0, 4 * -0.5);
        this.change_l2w(dm, ni);
        // �e�ۂ̓��B�\�z���Ԃ���߂Ă���
        if (this.gunTarget >= 0)
            this.gunTime = this.targetDis / (oi.length() * 1.1);
        if (this.gunTime > 1.0)
            this.gunTime = 1.0;
        // �e�ۂ̓����\�z�ʒu����߂�
        this.gcVel.x = this.position.x + ni.x + (oi.x - this.gVel.x * this.gunTime) * this.gunTime;
        this.gcVel.y = this.position.y + ni.y + (oi.y - this.gVel.y * this.gunTime) * this.gunTime;
        this.gcVel.z = this.position.z + ni.z + (oi.z + (-9.8 - this.gVel.z) * this.gunTime / 2) * this.gunTime;
        world.change3d(this, this.gcVel, sc);
        // �@�e��ڕW�֌�����
        if (this.gunTarget >= 0) {
            //c.set(world.plane[this.gunTarget].position.x, world.plane[this.gunTarget].position.y, world.plane[this.gunTarget].position.z);
            c.copy(world.plane[this.gunTarget].position);
            //c.addCons(<any>world.plane[this.gunTarget].velocity, this.gunTime);
            c.addScaledVector(world.plane[this.gunTarget].velocity, this.gunTime);
            world.change3d(this, c, a);
            world.change3d(this, world.plane[this.gunTarget].position, b);
            sc.x += b.x - a.x;
            sc.y += b.y - a.y;
        }
        if (this.targetSx > -1000) {
            var xx = (this.targetSx - sc.x);
            var yy = (this.targetSy - sc.y);
            var mm = Math.sqrt(xx * xx + yy * yy);
            if (mm > 20) {
                xx = xx / mm * 20;
                yy = yy / mm * 20;
            }
            this.gunVx += xx;
            this.gunVy -= yy;
        }
        this.gunX += this.gunVx * 100 / 300;
        this.gunY += this.gunVy * 100 / 300;
        this.gunVx -= this.gunVx * 0.3;
        this.gunVy -= this.gunVy * 0.3;
        // �@�e�ғ����E����`�F�b�N
        var y = this.gunY - 20;
        var r = Math.sqrt(this.gunX * this.gunX + this.gunY * this.gunY);
        if (r > 100) {
            var x = this.gunX;
            x *= 100 / r;
            y *= 100 / r;
            this.gunX = x;
            this.gunY = y + 20;
            this.gunVx = 0;
            this.gunVy = 0;
        }
        // �e�ۈړ�
        for (var _i = 0, _a = this.bullets; _i < _a.length; _i++) {
            var bullet = _a[_i];
            if (bullet.use !== 0) {
                bullet.move(world, this);
            }
        }
        // �e�۔��ˏ���
        if (this.gunShoot && this.gunTemp++ < Plane.MAXT) {
            for (var i = 0; i < Plane.BMAX; i++) {
                if (this.bullets[i].use === 0) {
                    // this.bullets[i].velocity.setPlus(this.velocity, oi);
                    this.bullets[i].velocity.addVectors(this.velocity, oi);
                    var aa = Math.random();
                    // this.bullets[i].position.setPlus(this.position, ni);
                    this.bullets[i].position.addVectors(this.position, ni);
                    // this.bullets[i].position.addCons(this.bullets[i].velocity, 0.1 * aa);
                    this.bullets[i].position.addScaledVector(this.bullets[i].velocity, 0.1 * aa);
                    this.bullets[i].oldPosition.set(this.bullets[i].position.x, this.bullets[i].position.y, this.bullets[i].position.z);
                    this.bullets[i].bom = 0;
                    this.bullets[i].use = 15;
                    break;
                }
            }
        }
        else if (this.gunTemp > 0) {
            this.gunTemp--;
        }
    };
    // �~�T�C���ړ��Ɣ��ˏ���
    Plane.prototype.moveAam = function (world) {
        var dm = new THREE.Vector3();
        var ni = new THREE.Vector3();
        var oi = new THREE.Vector3();
        for (var k = 0; k < Plane.MMMAX; k++) {
            // �e�~�T�C���ړ�
            if (this.aam[k].use > 0) {
                this.aam[k].move(world, this);
            }
            // �^�C���A�E�g���������
            if (this.aam[k].use === 0)
                this.aam[k].use = -1;
        }
        // �~�T�C�����ˏ���
        // �������A�ڕW���߂�����ƌ��ĂȂ�
        if (this.aamShoot && this.targetDis > 50) {
            // �g���Ă��Ȃ��~�T�C����T��
            var k = void 0;
            for (k = 0; k < Plane.MMMAX; k++) {
                if (this.aam[k].use < 0 && this.aamTarget[k] >= 0) {
                    break;
                }
            }
            if (k !== Plane.MMMAX) {
                var ap = this.aam[k];
                //  ���ˈʒu����߂�
                switch (k % 4) {
                    case 0:
                        dm.x = 6;
                        dm.z = 1;
                        break;
                    case 1:
                        dm.x = -6;
                        dm.z = 1;
                        break;
                    case 2:
                        dm.x = 6;
                        dm.z = -1;
                        break;
                    case 3:
                        dm.x = -6;
                        dm.z = -1;
                        break;
                }
                dm.y = 2;
                this.change_l2w(dm, ni);
                //  ���ˑ��x����߂�
                var v2 = 0;
                var v3 = 5;
                var vx = Math.random() * v3;
                var vy = Math.random() * v3;
                v2 *= (k / 4) + 1;
                vx *= (k / 4) + 1;
                vy *= (k / 4) + 1;
                switch (k % 4) {
                    case 0:
                        dm.x = vx;
                        dm.z = vy - v2;
                        break;
                    case 1:
                        dm.x = -vx;
                        dm.z = vy - v2;
                        break;
                    case 2:
                        dm.x = vx;
                        dm.z = -vy - v2;
                        break;
                    case 3:
                        dm.x = -vx;
                        dm.z = -vy - v2;
                        break;
                }
                dm.y = 40;
                this.change_l2w(dm, oi);
                // ap.position.setPlus(this.position, ni);
                ap.position.addVectors(this.position, ni);
                // ap.velocity.setPlus(this.velocity, oi);
                ap.velocity.addVectors(this.velocity, oi);
                // ���ˌ�������߂�
                switch (k % 4) {
                    case 0:
                        dm.x = 8;
                        dm.z = 1 + 10;
                        break;
                    case 1:
                        dm.x = -8;
                        dm.z = 1 + 10;
                        break;
                    case 2:
                        dm.x = 5;
                        dm.z = -1 + 10;
                        break;
                    case 3:
                        dm.x = -5;
                        dm.z = -1 + 10;
                        break;
                }
                dm.y = 50.0;
                dm.z += (k / 4) * 5;
                this.change_l2w(dm, oi);
                //let v = oi.abs();
                var v = oi.length();
                // ap.forward.setConsInv(oi, v);
                ap.forward.copy(oi);
                ap.forward.divideScalar(v);
                // �e�평����
                ap.use = 100;
                ap.count = 0;
                ap.bom = 0;
                ap.targetNo = this.aamTarget[k];
            }
        }
    };
    return Plane;
}(PhysicsState));
// �萔
Plane.BMAX = 20; // �e�ۂ̍ő吔
Plane.MMMAX = 4; // �~�T�C���̍ő吔
Plane.WMAX = 6; // ���̐�
Plane.MAXT = 50; // �@�e�̍ő剷�x
///<reference path="Applet3D.ts" />
///<reference path="Plane.ts" />
//
// Jflight�N���X
//
// jflight�p�̃A�v���b�g�N���X
// ���̃N���X��jflight���s�̋N�_
// Applet3D����p�����邱�Ƃ�3D�\������Ƌ��ɁA
// Runnable�C���^�[�t�F�C�X�p���ŃX���b�h��p����
//
//     �@�̍��W�n
//           Z
//           ^  X
//           | /
//           |/
//     Y<----
//     ���[���h���W�n
//     Z
//     ^  Y
//     | /
//     |/
//     -------->X
var Jflight = (function (_super) {
    __extends(Jflight, _super);
    // �A�v���b�g�̍\�z
    function Jflight(scene, hudCanvas) {
        var _this = _super.call(this) || this;
        _this.hudCanvas = hudCanvas;
        // �ϐ�
        _this.plane = []; // �e�@�̃I�u�W�F�N�g�ւ̔z��
        _this.autoFlight = true; // ���@�iplane[0]�j��������c�ɂ���̂�
        // �e���|�����I�u�W�F�N�g
        _this.pos = []; // �n�ʕ\���̍ۂ̃f�[�^��~���Ă������߂�Tmp
        _this.isMouseMove = false;
        // �@�̌`��̏�����
        _this.objInit();
        // �s�v�ȃK�[�x�b�W�R���N�V���������邽�߂ɁA
        // �I�u�W�F�N�g����߂ɏo���邾������Ă���
        for (var i = 0; i < Jflight.PMAX; i++) {
            _this.plane.push(new Plane(scene));
        }
        for (var j = 0; j < Jflight.GSCALE; j++) {
            _this.pos.push([]);
            for (var i = 0; i < Jflight.GSCALE; i++) {
                _this.pos[j].push(new THREE.Vector3());
            }
        }
        _this.hud = new HUD(hudCanvas, _this.plane[0]);
        // �e�@�̂̐ݒ�
        _this.plane[0].no = 0;
        _this.plane[1].no = 1;
        _this.plane[2].no = 2;
        _this.plane[3].no = 3;
        _this.plane[0].target = 2;
        _this.plane[1].target = 2;
        _this.plane[2].target = 1;
        _this.plane[3].target = 1;
        _this.plane[0].use = true;
        _this.plane[1].use = true;
        _this.plane[2].use = true;
        _this.plane[3].use = true;
        _this.plane[0].level = 20;
        _this.plane[1].level = 10;
        _this.plane[2].level = 20;
        _this.plane[3].level = 30;
        return _this;
    }
    // �A�v���b�g�̏�����
    // public init() {
    // }
    // �A�v���b�g�̋N��
    // public start() {
    // }
    // �A�v���b�g�̒�~
    // public stop() {
    // }
    // �@�̌`��̏�����
    Jflight.prototype.objInit = function () {
        if (Jflight.obj.length !== 0) {
            return;
        }
        for (var j = 0; j < 20; j++) {
            Jflight.obj.push([]);
            for (var i = 0; i < 3; i++) {
                Jflight.obj[j].push(new THREE.Vector3());
            }
        }
        // �S�ēƗ��O�p�`�ō\��
        // �{���͊e���_����L�������������������ł͕\�������ȗ���
        Jflight.obj[0][0].set(-0.000000, -2.000000, 0.000000);
        Jflight.obj[0][1].set(0.000000, 4.000000, 0.000000);
        Jflight.obj[0][2].set(6.000000, -2.000000, 0.000000);
        Jflight.obj[1][0].set(0.000000, -3.000000, 1.500000);
        Jflight.obj[1][1].set(2.000000, -3.000000, 0.000000);
        Jflight.obj[1][2].set(0.000000, 8.000000, 0.000000);
        Jflight.obj[2][0].set(2.000000, 0.000000, 0.000000);
        Jflight.obj[2][1].set(3.000000, 0.000000, -0.500000);
        Jflight.obj[2][2].set(3.500000, 0.000000, 0.000000);
        Jflight.obj[3][0].set(3.000000, 0.000000, 0.000000);
        Jflight.obj[3][1].set(3.000000, -1.000000, -1.500000);
        Jflight.obj[3][2].set(3.000000, 0.000000, -2.000000);
        Jflight.obj[4][0].set(3.000000, -1.000000, -2.000000);
        Jflight.obj[4][1].set(3.000000, 2.000000, -2.000000);
        Jflight.obj[4][2].set(3.500000, 1.000000, -2.500000);
        Jflight.obj[5][0].set(1.000000, 0.000000, -6.000000);
        Jflight.obj[5][1].set(2.000000, 4.000000, -6.000000);
        Jflight.obj[5][2].set(2.000000, -2.000000, 0.000000);
        Jflight.obj[6][0].set(3.000000, 0.000000, -6.000000);
        Jflight.obj[6][1].set(2.000000, 4.000000, -6.000000);
        Jflight.obj[6][2].set(2.000000, -2.000000, 0.000000);
        Jflight.obj[7][0].set(2.000000, 1.000000, 0.000000);
        Jflight.obj[7][1].set(2.000000, -3.000000, 4.000000);
        Jflight.obj[7][2].set(2.000000, -3.000000, -2.000000);
        Jflight.obj[8][0].set(1.000000, 0.000000, 0.000000);
        Jflight.obj[8][1].set(0.000000, 0.000000, -1.000000);
        Jflight.obj[8][2].set(0.000000, 1.000000, 0.000000);
        Jflight.obj[9][0].set(0.000000, -2.000000, 0.000000);
        Jflight.obj[9][1].set(0.000000, 4.000000, 0.000000);
        Jflight.obj[9][2].set(-6.000000, -2.000000, 0.000000);
        Jflight.obj[10][0].set(0.000000, -3.000000, 1.500000);
        Jflight.obj[10][1].set(-2.000000, -3.000000, 0.000000);
        Jflight.obj[10][2].set(0.000000, 8.000000, 0.000000);
        Jflight.obj[11][0].set(-2.000000, 0.000000, 0.000000);
        Jflight.obj[11][1].set(-3.000000, 0.000000, -0.500000);
        Jflight.obj[11][2].set(-3.500000, 0.000000, 0.000000);
        Jflight.obj[12][0].set(-3.000000, 0.000000, 0.000000);
        Jflight.obj[12][1].set(-3.000000, -1.000000, -1.500000);
        Jflight.obj[12][2].set(-3.000000, 0.000000, -2.000000);
        Jflight.obj[13][0].set(-3.000000, -1.000000, -2.000000);
        Jflight.obj[13][1].set(-3.000000, 2.000000, -2.000000);
        Jflight.obj[13][2].set(-3.500000, 1.000000, -2.500000);
        Jflight.obj[14][0].set(-1.000000, 0.000000, -6.000000);
        Jflight.obj[14][1].set(-2.000000, 4.000000, -6.000000);
        Jflight.obj[14][2].set(-2.000000, -2.000000, 0.000000);
        Jflight.obj[15][0].set(-3.000000, 0.000000, -6.000000);
        Jflight.obj[15][1].set(-2.000000, 4.000000, -6.000000);
        Jflight.obj[15][2].set(-2.000000, -2.000000, 0.000000);
        Jflight.obj[16][0].set(-2.000000, 1.000000, 0.000000);
        Jflight.obj[16][1].set(-2.000000, -3.000000, 4.000000);
        Jflight.obj[16][2].set(-2.000000, -3.000000, -2.000000);
        Jflight.obj[17][0].set(-1.000000, 0.000000, 0.000000);
        Jflight.obj[17][1].set(0.000000, 0.000000, -1.000000);
        Jflight.obj[17][2].set(0.000000, 1.000000, 0.000000);
        Jflight.obj[18][0].set(3.000000, 0.000000, -2.000000);
        Jflight.obj[18][1].set(3.000000, 0.000000, -1.500000);
        Jflight.obj[18][2].set(3.000000, 7.000000, -2.000000);
    };
    // �A�v���b�g�̕\��
    // ���ۂ̓��쒆�͂�����ł͂Ȃ��Arun()�̕��ŕ\�������
    Jflight.prototype.paint = function (context) {
        this.draw(context);
    };
    // ��ʕ\��
    Jflight.prototype.draw = function (context) {
        // let width = this.width;
        // let height = this.height;
        // let centerX = width / 2;
        // let centerY = height / 2;
        // �o�b�N�o�b�t�@�N���A
        this.clear(context);
        // ���@�̕ϊ��s���O�̂��ߍČv�Z���Ă���
        this.plane[0].checkTrans();
        // �n�ʕ\��
        // this.writeGround(context);
        // �@�̕\��
        // this.writePlane(context);
        this.hud.render(this.hudCanvas);
    };
    // ���C�����[�v
    Jflight.prototype.run = function () {
        // �X�y�[�X�L�[�������ꂽ�玩�����cOFF
        if (keyboard.pressed("space")) {
            this.autoFlight = false;
        }
        // �e�@��ړ�
        this.plane[0].move(this, this.autoFlight);
        for (var i = 1; i < Jflight.PMAX; i++) {
            this.plane[i].move(this, true);
        }
    };
    Jflight.prototype.render = function (context) {
        // �J�����ʒu����@�ɃZ�b�g���ĕ\��
        this.camerapos.set(this.plane[0].position.x, this.plane[0].position.y, this.plane[0].position.z);
        this.draw(context);
    };
    // �e�@�̂�\��
    // �e�ۂ�~�T�C��������ŕ\�����Ă���
    Jflight.prototype.writePlane = function (context) {
        var s0 = new THREE.Vector3();
        var s1 = new THREE.Vector3();
        var s2 = new THREE.Vector3();
        for (var i = 0; i < Jflight.PMAX; i++) {
            if (this.plane[i].use) {
                this.writeGun(context, this.plane[i]);
                this.writeAam(context, this.plane[i]);
                //���@�ȊO�̋@�̂�\��
                // �e�@�̂̃��[�N�p���W�ϊ��s���Čv�Z
                //this.plane[0].checkTransM(this.plane[i].aVel);
                var a = new THREE.Euler(this.plane[i].rotation.x, -this.plane[i].rotation.y, this.plane[i].rotation.z, 'YXZ');
                var m = new THREE.Matrix4();
                m.makeRotationFromEuler(a);
                m.transpose();
                if (i !== 0) {
                    for (var j = 0; j < 19; j++) {
                        // �e�@�̃��[�J�����W���烏�[���h���W�ɕϊ�
                        // ���{���̓A�t�B���ϊ��ł܂Ƃ߂ĕϊ�����ׂ�
                        // this.plane[0].change_ml2w(Jflight.obj[j][0], p0);
                        var p0 = Jflight.obj[j][0].clone();
                        p0.applyMatrix4(m);
                        // this.plane[0].change_ml2w(Jflight.obj[j][1], p1);
                        var p1 = Jflight.obj[j][1].clone();
                        p1.applyMatrix4(m);
                        // this.plane[0].change_ml2w(Jflight.obj[j][2], p2);
                        var p2 = Jflight.obj[j][2].clone();
                        p2.applyMatrix4(m);
                        p0.add(this.plane[i].position);
                        p1.add(this.plane[i].position);
                        p2.add(this.plane[i].position);
                        // ���[���h���W��A�X�N���[�����W�ɕϊ�
                        this.change3d(this.plane[0], p0, s0);
                        this.change3d(this.plane[0], p1, s1);
                        this.change3d(this.plane[0], p2, s2);
                        // �O�p�`�\��
                        this.drawPoly(context, s0, s1, s2);
                    }
                }
            }
        }
    };
    // �@�e��\��
    Jflight.prototype.writeGun = function (context, aplane) {
        var dm = new THREE.Vector3();
        var dm2 = new THREE.Vector3();
        var cp = new THREE.Vector3();
        for (var j = 0; j < Plane.BMAX; j++) {
            var bp = aplane.bullets[j];
            // use�J�E���^��0���傫����̂̂ݕ\��
            if (bp.use > 0) {
                // �e�ۂ̈ʒu�Ƃ��̑��x���烉�C����\��
                // �X�N���[���ɋ߂��ꍇ�A��������\��
                if (cp.z < 400) {
                    // 0.005�b��`0.04�b��̒e�ۈʒu����C���\��
                    dm.x = bp.position.x + bp.velocity.x * 0.005;
                    dm.y = bp.position.y + bp.velocity.y * 0.005;
                    dm.z = bp.position.z + bp.velocity.z * 0.005;
                    this.change3d(this.plane[0], dm, cp);
                    dm.x = bp.position.x + bp.velocity.x * 0.04;
                    dm.y = bp.position.y + bp.velocity.y * 0.04;
                    dm.z = bp.position.z + bp.velocity.z * 0.04;
                    this.change3d(this.plane[0], dm, dm2);
                    this.drawBline(context, cp, dm2);
                }
                // ���݈ʒu�`0.05�b��̒e�ۈʒu����C���\��
                this.change3d(this.plane[0], bp.position, cp);
                dm.x = bp.position.x + bp.velocity.x * 0.05;
                dm.y = bp.position.y + bp.velocity.y * 0.05;
                dm.z = bp.position.z + bp.velocity.z * 0.05;
                this.change3d(this.plane[0], dm, dm2);
                this.drawBlined(context, cp, dm2);
            }
            // �e�ۂ��������̏ꍇ�A���~�\��
            if (bp.bom > 0) {
                this.change3d(this.plane[0], bp.oldPosition, cp);
                this.fillBarc(cp);
                bp.bom--;
            }
        }
    };
    // �~�T�C���Ƃ��̉���\��
    Jflight.prototype.writeAam = function (context, aplane) {
        var dm = new THREE.Vector3();
        var cp = new THREE.Vector3();
        for (var j = 0; j < Plane.MMMAX; j++) {
            var ap = aplane.aam[j];
            // use�J�E���^��0���傫����̂̂ݕ\��
            if (ap.use >= 0) {
                // �~�T�C�����������łȂ���΁A�~�T�C���{�̂�\��
                if (ap.bom <= 0) {
                    dm.x = ap.position.x + ap.forward.x * 4;
                    dm.y = ap.position.y + ap.forward.y * 4;
                    dm.z = ap.position.z + ap.forward.z * 4;
                    this.change3d(this.plane[0], dm, cp);
                    this.change3d(this.plane[0], ap.position, dm);
                    this.drawAline(cp, dm);
                }
                // �~�T�C���̉���\��
                // ���̍��W�̓����O�o�b�t�@�Ɋi�[����Ă���
                var k = (ap.use + Missile.MOMAX + 1) % Missile.MOMAX;
                this.change3d(this.plane[0], ap.oldPositions[k], dm);
                for (var m = 0; m < ap.count; m++) {
                    this.change3d(this.plane[0], ap.oldPositions[k], cp);
                    this.drawMline(context, dm, cp);
                    k = (k + Missile.MOMAX + 1) % Missile.MOMAX;
                    dm.set(cp.x, cp.y, cp.z);
                }
            }
            // �~�T�C�����������̏ꍇ�A���~�\��
            if (ap.bom > 0) {
                this.change3d(this.plane[0], ap.position, cp);
                this.fillBarc(cp);
            }
        }
    };
    // �n�ʂ�\��
    Jflight.prototype.writeGround = function (context) {
        var mx, my;
        var i, j;
        var p = new THREE.Vector3();
        // �n�ʃO���b�h�̑傫����v�Z
        var step = Jflight.FMAX * 2 / Jflight.GSCALE;
        // ���@�̃O���b�h�ʒu�ƃI�t�Z�b�g��v�Z
        var dx = (this.plane[0].position.x / step);
        var dy = (this.plane[0].position.y / step);
        var sx = dx * step;
        var sy = dy * step;
        // �e�O���b�h�_��X�N���[�����W�ɕϊ�
        my = -Jflight.FMAX;
        for (j = 0; j < Jflight.GSCALE; j++) {
            mx = -Jflight.FMAX;
            for (i = 0; i < Jflight.GSCALE; i++) {
                p.x = mx + sx;
                p.y = my + sy;
                p.z = this.gHeight(mx + sx, my + sy);
                this.change3d(this.plane[0], p, this.pos[j][i]);
                mx += step;
            }
            my += step;
        }
        // ����i�q��\��
        for (j = 0; j < Jflight.GSCALE; j++) {
            for (i = 0; i < Jflight.GSCALE - 1; i++) {
                this.drawSline(context, this.pos[j][i], this.pos[j][i + 1]);
            }
        }
        for (i = 0; i < Jflight.GSCALE; i++) {
            for (j = 0; j < Jflight.GSCALE - 1; j++) {
                this.drawSline(context, this.pos[j][i], this.pos[j + 1][i]);
            }
        }
    };
    // �n�ʂ̍�����v�Z
    Jflight.prototype.gHeight = function (_px, _py) {
        return 0;
    };
    // �n�ʂ̌X����v�Z
    Jflight.prototype.gGrad = function (_px, _py, p) {
        p.x = 0;
        p.y = 0;
    };
    return Jflight;
}(Applet3D));
// �萔�錾
Jflight.FMAX = 10000; // �t�B�[���h�̑傫��
Jflight.GSCALE = 16; // �t�B�[���h�̕�����
Jflight.PMAX = 4; // �@�̂̍ő吔
Jflight.G = -9.8; // �d�͉����x
Jflight.DT = 0.05; // �v�Z�X�e�b�v��
Jflight.obj = []; // �@�̂̌`��i�O�p�`�̏W���j
var HUD = (function () {
    function HUD(canvas, plane) {
        this.canvas = canvas;
        this.plane = plane;
        var context = canvas.getContext("2d");
        if (context) {
            this.context = context;
        }
    }
    HUD.prototype.drawLine = function (context, strokeStyle, x1, y1, x2, y2) {
        context.save();
        context.strokeStyle = strokeStyle;
        //描画することを宣言する
        context.beginPath();
        //描き始め（始点）を決定する
        context.moveTo(x1, y1);
        //始点から指定の座標まで線を引く
        context.lineTo(x2, y2);
        //引き続き線を引いていく
        //context.lineTo(0, 100);
        //context.lineTo(51, 15);
        //描画を終了する
        context.closePath();
        //上記記述は定義情報である。この命令で線を描く。
        context.stroke();
        context.restore();
    };
    HUD.prototype.drawCircle = function (context, strokeStyle, centerX, centerY, radius) {
        context.save();
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        //context.fillStyle = 'green';
        //context.fill();
        context.lineWidth = 2;
        context.strokeStyle = strokeStyle;
        context.stroke();
        context.restore();
    };
    HUD.prototype.fillText = function (context, text, x, y) {
        context.save();
        context.font = "18px 'ＭＳ Ｐゴシック'";
        context.fillStyle = "white";
        context.fillText(text, x, y);
        context.restore();
    };
    HUD.prototype.drawCross = function (context, x, y, length) {
        this.drawLine(context, "rgb(255, 255, 255)", x, y - length, x, y + length);
        this.drawLine(context, "rgb(255, 255, 255)", x - length, y, x + length, y);
    };
    HUD.prototype.render = function (canvas) {
        // let _w = this.canvas.width;
        // _w = 0;
        var width = this.canvas.width;
        var height = this.canvas.height;
        var centerX = width / 2;
        var centerY = height / 2;
        var context = canvas.getContext("2d");
        if (context) {
            this.drawCross(context, centerX, centerY, 15);
            var radius = height / 2 * 0.8;
            this.drawCircle(context, "rgb(255, 255, 255)", centerX, centerY, height / 2 * 0.8);
            this.drawCircle(context, "rgb(255, 255, 255)", centerX + this.plane.stickPos.y * radius, centerY - this.plane.stickPos.x * radius, 10);
            this.drawCircle(context, "rgb(255, 255, 255)", centerX + Jflight.mouseX, centerY + Jflight.mouseY, 10);
            var y = this.plane.rotation.y;
            context.save();
            // Move registration point to the center of the canvas
            context.translate(width / 2, height / 2);
            // Rotate 1 degree
            context.rotate(-y);
            // Move registration point back to the top left corner of canvas
            context.translate(-width / 2, -height / 2);
            var x = -this.plane.rotation.x;
            for (var i = -170; i <= 180; i += 10) {
                // let x = -this.plane[0].aVel.x + (i * Math.PI / 180);
                // let distance = 300;
                this.drawLine(context, "rgb(255, 255, 255)", centerX - 150, centerY + i * 20 + Math.tan(x) * centerY, centerX + 150, centerY + i * 20 + Math.tan(x) * centerY);
            }
            context.restore();
            this.fillText(context, "Speed=" + this.plane.velocity.length(), 50, 50);
        }
    };
    return HUD;
}());
/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/
THREE.ShaderLib['sky'] = {
    uniforms: {
        luminance: { value: 1 },
        turbidity: { value: 2 },
        rayleigh: { value: 1 },
        mieCoefficient: { value: 0.005 },
        mieDirectionalG: { value: 0.8 },
        sunPosition: { value: new THREE.Vector3() }
    },
    vertexShader: "\n        uniform vec3 sunPosition;\n        uniform float rayleigh;\n        uniform float turbidity;\n        uniform float mieCoefficient;\n\n        varying vec3 vWorldPosition;\n        varying vec3 vSunDirection;\n        varying float vSunfade;\n        varying vec3 vBetaR;\n        varying vec3 vBetaM;\n        varying float vSunE;\n\n        const vec3 up = vec3(0.0, 0.0, 1.0);\n\n        // constants for atmospheric scattering\n        const float e = 2.71828182845904523536028747135266249775724709369995957;\n        const float pi = 3.141592653589793238462643383279502884197169;\n\n        // mie stuff\n        // K coefficient for the primaries\n        const float v = 4.0;\n        const vec3 K = vec3(0.686, 0.678, 0.666);\n\n        // see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness\n        // A simplied version of the total Reayleigh scattering to works on browsers that use ANGLE\n        const vec3 simplifiedRayleigh = 0.0005 / vec3(94, 40, 18);\n\n        // wavelength of used primaries, according to preetham\n        const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);\n\n        // earth shadow hack\n        const float cutoffAngle = pi/1.95;\n        const float steepness = 1.5;\n        const float EE = 1000.0;\n\n        float sunIntensity(float zenithAngleCos)\n        {\n            zenithAngleCos = clamp(zenithAngleCos, -1.0, 1.0);\n            return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos))/steepness)));\n        }\n\n        vec3 totalMie(vec3 lambda, float T)\n        {\n            float c = (0.2 * T ) * 10E-18;\n            return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;\n        }\n\n        void main() {\n\n            vec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n            vWorldPosition = worldPosition.xyz;\n\n            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n            vSunDirection = normalize(sunPosition);\n\n            vSunE = sunIntensity(dot(vSunDirection, up));\n\n            vSunfade = 1.0-clamp(1.0-exp((sunPosition.z/450000.0)),0.0,1.0);\n\n            float rayleighCoefficient = rayleigh - (1.0 * (1.0-vSunfade));\n\n            // extinction (absorbtion + out scattering)\n            // rayleigh coefficients\n            vBetaR = simplifiedRayleigh * rayleighCoefficient;\n\n            // mie coefficients\n            vBetaM = totalMie(lambda, turbidity) * mieCoefficient;\n        }\n    ",
    fragmentShader: "\n        varying vec3 vWorldPosition;\n        varying vec3 vSunDirection;\n        varying float vSunfade;\n        varying vec3 vBetaR;\n        varying vec3 vBetaM;\n        varying float vSunE;\n\n        uniform float luminance;\n        uniform float mieDirectionalG;\n\n        const vec3 cameraPos = vec3(0., 0., 0.);\n\n        // constants for atmospheric scattering\n        const float pi = 3.141592653589793238462643383279502884197169;\n\n        const float n = 1.0003; // refractive index of air\n        const float N = 2.545E25; // number of molecules per unit volume for air at\n        // 288.15K and 1013mb (sea level -45 celsius)\n\n        // optical length at zenith for molecules\n        const float rayleighZenithLength = 8.4E3;\n        const float mieZenithLength = 1.25E3;\n        const vec3 up = vec3(0.0, 0.0, 1.0);\n\n        const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;\n        // 66 arc seconds -> degrees, and the cosine of that\n\n        float rayleighPhase(float cosTheta)\n        {\n            return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));\n        }\n\n        float hgPhase(float cosTheta, float g)\n        {\n            return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));\n        }\n\n        // Filmic ToneMapping http://filmicgames.com/archives/75\n        const float A = 0.15;\n        const float B = 0.50;\n        const float C = 0.10;\n        const float D = 0.20;\n        const float E = 0.02;\n        const float F = 0.30;\n\n        const float whiteScale = 1.0748724675633854; // 1.0 / Uncharted2Tonemap(1000.0)\n\n        vec3 Uncharted2Tonemap(vec3 x)\n        {\n            return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;\n        }\n\n\n        void main()\n        {\n            // optical length\n            // cutoff angle at 90 to avoid singularity in next formula.\n            float zenithAngle = acos(max(0.0, dot(up, normalize(vWorldPosition - cameraPos))));\n            float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));\n            float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));\n\n            // combined extinction factor\n            vec3 Fex = exp(-(vBetaR * sR + vBetaM * sM));\n\n            // in scattering\n            float cosTheta = dot(normalize(vWorldPosition - cameraPos), vSunDirection);\n\n            float rPhase = rayleighPhase(cosTheta*0.5+0.5);\n            vec3 betaRTheta = vBetaR * rPhase;\n\n            float mPhase = hgPhase(cosTheta, mieDirectionalG);\n            vec3 betaMTheta = vBetaM * mPhase;\n\n            vec3 Lin = pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * (1.0 - Fex),vec3(1.5));\n            Lin *= mix(vec3(1.0),pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up, vSunDirection),5.0),0.0,1.0));\n\n            //nightsky\n            vec3 direction = normalize(vWorldPosition - cameraPos);\n            float theta = acos(direction.z); // elevation --> y-axis, [-pi/2, pi/2]\n            float phi = atan(-direction.y, direction.x); // azimuth --> x-axis [-pi/2, pi/2]\n            vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);\n            vec3 L0 = vec3(0.1) * Fex;\n\n            // composition + solar disc\n            float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);\n            L0 += (vSunE * 19000.0 * Fex)*sundisk;\n\n            vec3 texColor = (Lin+L0) * 0.04 + vec3(0.0, 0.0003, 0.00075);\n\n            vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);\n            vec3 color = curr*whiteScale;\n\n            vec3 retColor = pow(color,vec3(1.0/(1.2+(1.2*vSunfade))));\n\n            gl_FragColor.rgb = retColor;\n\n            gl_FragColor.a = 1.0;\n        }\n    "
};
var Sky = (function () {
    function Sky() {
        var skyShader = THREE.ShaderLib["sky"];
        var skyUniforms = THREE.UniformsUtils.clone(skyShader.uniforms);
        var skyMat = new THREE.ShaderMaterial({
            fragmentShader: skyShader.fragmentShader,
            vertexShader: skyShader.vertexShader,
            uniforms: skyUniforms,
            side: THREE.BackSide
        });
        var skyGeo = new THREE.SphereBufferGeometry(450000, 32, 15);
        var skyMesh = new THREE.Mesh(skyGeo, skyMat);
        skyMesh.rotateX(Math.PI / 2);
        // Expose variables
        this.mesh = skyMesh;
        this.uniforms = skyUniforms;
    }
    return Sky;
}());
///<reference path="../node_modules/@types/three/index.d.ts" />
///<reference path="THREEx.KeyboardState.ts" />
///<reference path="THREEx.WindowResize.ts" />
///<reference path="Jflight.ts" />
///<reference path="HUD.ts" />
///<reference path="./Sky/SkyShader.ts" />
var keyboard = new THREEx.KeyboardState();
var Main;
(function (Main) {
    "use strict";
    var flight;
    /* canvas要素のノードオブジェクト */
    var canvas;
    // standard global variables
    var container;
    var scene;
    var camera;
    var renderer;
    var mouseX;
    var mouseY;
    // var stats: Stats;
    var clock = new THREE.Clock();
    // custom global variables
    // var boomer: TextureAnimator; // animators
    // var man: Billboard;
    // var controls: THREE.OrbitControls;
    // functions
    function init() {
        canvas = document.getElementById("canvas");
        canvas.onmousemove = onMouseMove;
        // scene
        scene = new THREE.Scene();
        // camera
        var SCREEN_WIDTH = window.innerWidth;
        var SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 90;
        var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
        var NEAR = 0.1;
        var FAR = 2000000;
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        scene.add(camera);
        camera.position.z = SCREEN_HEIGHT / 2;
        camera.lookAt(scene.position);
        // RENDERER
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        container = document.getElementById("ThreeJS");
        container.appendChild(renderer.domElement);
        // EVENTS
        THREEx.WindowResize(renderer, camera);
        // THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });
        // CONTROLS
        // controls = new THREE.OrbitControls(camera, renderer.domElement);
        // STATS
        // stats = new Stats();
        // stats.dom.style.position = 'absolute';
        // stats.dom.style.bottom = '0px';
        // stats.dom.style.zIndex = '100';
        // container.appendChild(stats.dom);
        // LIGHT
        // var light = new THREE.PointLight(0xffffff);
        // light.position.set(0, 250, 0);
        // scene.add(light);
        // var directionalLight = new THREE.DirectionalLight(0xffffff);
        // directionalLight.position.set(0, 0.7, 0.7);
        // scene.add(directionalLight);
        // FLOOR
        // let pitch = new _SoccerPitch(scene);
        // SKYBOX/FOG
        // var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
        // var skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.BackSide });
        // var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
        // scene.add(skyBox);
        // scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);
        ////////////
        // CUSTOM //
        ////////////
        // GridHelper(大きさ, １マスの大きさ)
        var grid = new THREE.GridHelper(100000, 100);
        grid.rotateX(Math.PI / 2);
        //シーンオブジェクトに追加
        scene.add(grid);
        // 軸の長さ10000
        var axis = new THREE.AxisHelper(10000);
        // sceneに追加
        scene.add(axis);
        // MESHES WITH ANIMATED TEXTURES!
        // man = new Billboard(scene);
        // Add Sky Mesh
        var sky = new Sky();
        scene.add(sky.mesh);
        // Add Sun Helper
        var sunSphere = new THREE.Mesh(new THREE.SphereBufferGeometry(20000, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        //sunSphere.position.y = - 700000;
        sunSphere.position.z = -700000;
        sunSphere.visible = false;
        scene.add(sunSphere);
        /// GUI
        var effectController = {
            turbidity: 10,
            rayleigh: 2,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.8,
            luminance: 1,
            inclination: /*0.49*/ 1,
            azimuth: /*0.25*/ 0.7,
            sun: !true
        };
        var distance = 400000;
        function guiChanged() {
            var uniforms = sky.uniforms;
            uniforms.turbidity.value = effectController.turbidity;
            uniforms.rayleigh.value = effectController.rayleigh;
            uniforms.luminance.value = effectController.luminance;
            uniforms.mieCoefficient.value = effectController.mieCoefficient;
            uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
            var theta = Math.PI * (effectController.inclination - 0.5);
            var phi = 2 * Math.PI * (effectController.azimuth - 0.5);
            sunSphere.position.x = distance * Math.cos(phi);
            sunSphere.position.z = distance * Math.sin(phi) * Math.sin(theta);
            sunSphere.position.y = -distance * Math.sin(phi) * Math.cos(theta);
            sunSphere.visible = effectController.sun;
            sky.uniforms.sunPosition.value.copy(sunSphere.position);
            renderer.render(scene, camera);
        }
        var gui = new dat.GUI();
        gui.add(effectController, "turbidity", 1.0, 20.0 /*, 0.1*/).onChange(guiChanged);
        gui.add(effectController, "rayleigh", 0.0, 4 /*, 0.001*/).onChange(guiChanged);
        gui.add(effectController, "mieCoefficient", 0.0, 0.1 /*, 0.001*/).onChange(guiChanged);
        gui.add(effectController, "mieDirectionalG", 0.0, 1 /*, 0.001*/).onChange(guiChanged);
        gui.add(effectController, "luminance", 0.0, 2).onChange(guiChanged);
        gui.add(effectController, "inclination", 0, 1 /*, 0.0001*/).onChange(guiChanged);
        gui.add(effectController, "azimuth", 0, 1 /*, 0.0001*/).onChange(guiChanged);
        gui.add(effectController, "sun").onChange(guiChanged);
        guiChanged();
        // var explosionTexture = new THREE.TextureLoader().load('images/explosion.jpg');
        // boomer = new TextureAnimator(explosionTexture, 4, 4, 16, 55); // texture, #horiz, #vert, #total, duration.
        // var explosionMaterial = new THREE.MeshBasicMaterial({ map: explosionTexture });
        flight = new Jflight(scene, canvas);
    }
    Main.init = init;
    function onMouseMove(ev) {
        var rect = canvas.getBoundingClientRect(); //ev.target.getBoundingClientRect();
        mouseX = ev.clientX - rect.left;
        mouseY = ev.clientY - rect.top;
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        Jflight.mouseX = mouseX - centerX;
        Jflight.mouseY = mouseY - centerY;
        var radius = centerY * 0.8;
        if (Math.sqrt(Math.pow(Jflight.mouseX, 2) + Math.pow(Jflight.mouseY, 2)) > radius) {
            var l = Math.sqrt(Math.pow(Jflight.mouseX, 2) + Math.pow(Jflight.mouseY, 2));
            Jflight.mouseX /= l; // mouseX - centerX;
            Jflight.mouseY /= l; // mouseY - centerY;
            Jflight.mouseX *= radius;
            Jflight.mouseY *= radius;
        }
        Jflight.mouseX /= radius;
        Jflight.mouseY /= radius;
        flight.isMouseMove = true;
    }
    function animate() {
        requestAnimationFrame(animate);
        // 
        update();
        render();
    }
    Main.animate = animate;
    function update() {
        var delta = clock.getDelta();
        delta = 0;
        // Jflight.DT = delta;
        /* 2Dコンテキスト */
        //let context = canvas.getContext("2d");
        flight.run();
        // boomer.update(1000 * delta);
        // man.update(1000 * delta);
        // if (keyboard.pressed("z")) {
        // do something
        // }
        // controls.update();
        // stats.update();
        // man.quaternion(camera.quaternion);
        // let m = new THREE.Matrix4();
        // let elements = flight.plane[0].matrix.elements;
        var m = flight.plane[0].matrix;
        var a = new THREE.Matrix4();
        a.copy(m);
        a.transpose();
        var xAxis = new THREE.Vector3();
        var yAxis = new THREE.Vector3();
        var zAxis = new THREE.Vector3();
        a.extractBasis(xAxis, yAxis, zAxis);
        m.makeBasis(xAxis, zAxis, yAxis.negate());
        // m.elements[0] = elements[0]; m.elements[4] = elements[2]; m.elements[8] = -elements[1];
        // m.elements[1] = elements[4]; m.elements[5] = elements[6]; m.elements[9] = -elements[5];
        // m.elements[2] = elements[8]; m.elements[6] = elements[10]; m.elements[10] = -elements[9];
        camera.setRotationFromMatrix(m);
        camera.position.set(flight.camerapos.x, flight.camerapos.y, flight.camerapos.z);
        flight.plane[1].line.position.set(flight.plane[1].position.x, flight.plane[1].position.y, flight.plane[1].position.z);
        flight.plane[2].line.position.set(flight.plane[2].position.x, flight.plane[2].position.y, flight.plane[2].position.z);
        flight.plane[3].line.position.set(flight.plane[3].position.x, flight.plane[3].position.y, flight.plane[3].position.z);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        flight.setWidth(window.innerWidth);
        flight.setHeight(window.innerHeight);
    }
    function render() {
        renderer.render(scene, camera);
        var context = canvas.getContext("2d");
        if (context) {
            flight.render(context);
        }
    }
})(Main || (Main = {}));
Main.init();
Main.animate();
var MathHelper;
(function (MathHelper) {
    MathHelper.EpsilonDouble = 1e-6;
    MathHelper.Pi = Math.PI; // πの値を表します。
    MathHelper.PiOver2 = Math.PI / 2; // πを 2 で割った値 (π/2) を表します。
    MathHelper.PiOver4 = Math.PI / 4; // πを 4 で割った値 (π/4) を表します。
    MathHelper.TwoPi = Math.PI * 2; // pi の 2 倍の値を表します。
    function toDegrees(radians) {
        // This method uses double precission internally,
        // though it returns single float
        // Factor = 180 / pi
        return radians * 180 / MathHelper.Pi;
    }
    MathHelper.toDegrees = toDegrees;
    function toRadians(degrees) {
        // This method uses double precission internally,
        // though it returns single float
        // Factor = pi / 180
        return degrees * MathHelper.Pi / 180;
    }
    MathHelper.toRadians = toRadians;
})(MathHelper || (MathHelper = {}));
var Vector3Helper;
(function (Vector3Helper) {
    var result = new THREE.Vector3();
    function cross(vector1, vector2) {
        return result.crossVectors(vector1, vector2);
    }
    Vector3Helper.cross = cross;
})(Vector3Helper || (Vector3Helper = {}));
//# sourceMappingURL=jflight.js.map