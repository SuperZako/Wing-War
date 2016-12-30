///<reference path="./Physics/PhysicsState.ts" />
///<reference path="Wing.ts" />
///<reference path="Bullet.ts" />
///<reference path="Missile.ts" />

//
// Plane
// 機体クラス
//
// 各弾丸やミサイルを動かしているのもこのクラス
//

class Plane extends PhysicsState {

    // 定数

    static readonly  BMAX = 20;    // 弾丸の最大数
    static readonly  MMMAX = 4;    // ミサイルの最大数
    static readonly  WMAX = 6;     // 翼の数
    static readonly  MAXT = 50;    // 機銃の最大温度

    // 変数

    // ワールド座標→機体座標への変換行列

    protected cosa: number;
    protected cosb: number;
    protected cosc: number;

    protected sina: number;
    protected sinb: number;
    protected sinc: number;

    matrix = new THREE.Matrix4();


    // 機体
    public use: boolean;             // この機体を使用するか
    public no: number;                  // 機体No.
    public wings: Wing[] = [];       // 各翼(0,1-主翼,2-水平尾翼,3-垂直尾翼,4,5-エンジン)

    // public position = new CVector3();    // 機体位置（ワールド座標系）
    // public vpVel = new CVector3();   // 機体速度（ワールド座標系）
    // public aVel = new THREE.Euler();    // 機体向き（オイラー角）

    public localVelocity = new THREE.Vector3();    // 機体速度（機体座標系）
    public gVel = new THREE.Vector3();    // 機体加速度（ワールド座標系）

    public vaVel = new THREE.Vector3();   // 機体回転速度（オイラー角）
    public gcVel = new THREE.Vector3();   // 弾丸の将来予想位置
    public height: number;           // 機体の高度
    public gHeight: number;          // 機体直下の地面の高さ
    public mass: number;             // 機体質量
    public iMass = new THREE.Vector3();   // 機体各軸の慣性モーメント
    public onGround: boolean;        // 地面上にいるかどうか
    public aoa: number;              // 機体の迎角

    // 操縦系

    public stickPos = new THREE.Vector3();   // 操縦系位置（x,y-スティック,z-ペダル）
    public stickVel = new THREE.Vector3();   // 操縦系変化率

    public readonly stickR = 0.1;    // 操縦系の感度 (R-センターへの減衰率)
    public readonly stickA = 0.05;    // 操縦系の感度（A-変化率）

    public power: number;               // エンジン推力比率（ミリタリー時で9）
    public throttle: number;            // スロットル位置（ミリタリー時で9）
    public boost: boolean;           // ブースト
    public gunShoot: boolean;        // 機銃トリガー
    public aamShoot: boolean;        // ミサイルトリガー
    public level: number;
    public target: number;       // 自動操縦時のレベルと目標

    // 機銃系

    public bullets: Bullet[] = [];         // 各弾丸オブジェクト
    public gunTarget: number;           // 主目標の機体No.
    public targetSx: number;
    targetSy: number;  // 主目標の位置（スクリーン座標）
    public targetDis: number;        // 主目標までの距離
    public gunTime: number;          // 弾丸衝突予想時間（機銃の追尾に使用）

    public gunX: number;
    public gunY: number;       // 機銃の向き（上下左右稼働範囲で-1～1）

    public gunVx: number;
    public gunVy: number;     // 機銃向きの変化率

    public gunTemp: number;             // 機銃の温度（0からMAXTまで）
    public heatWait: boolean;        // 自動操縦時の機銃オーバーヒート解除待ち

    // ミサイル系

    public aam: Missile[] = [];         // 各ミサイルオブジェクト
    public aamTarget: number[];         // 各ミサイルのロック目標

    line: THREE.Line;

    // コンストラクタ
    public constructor(scene: THREE.Scene) {
        super();
        for (let i = 0; i < Plane.BMAX; i++) {
            this.bullets.push(new Bullet(scene));
        }

        for (let i = 0; i < Plane.MMMAX; i++) {
            this.aam.push(new Missile(scene));
        }

        for (let i = 0; i < Plane.WMAX; i++) {
            this.wings.push(new Wing());
        }

        this.aamTarget = new Array<number>(Plane.MMMAX);

        this.posInit();


        var material = new THREE.LineBasicMaterial({ color: 0xffffff });

        var geometry = new THREE.Geometry();

        for (let vertices of Jflight.obj) {
            geometry.vertices.push(vertices[0].clone());
            geometry.vertices.push(vertices[1].clone());
            geometry.vertices.push(vertices[2].clone());
        }

        this.line = new THREE.Line(geometry, material);

        scene.add(this.line);
    }

    // 各変数を初期化する

    public posInit() {
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


        let wa = 45 * Math.PI / 180;
        let wa2 = 0 * Math.PI / 180;

        // 各翼の位置と向きをセット

        //  右翼???
        this.wings[0].position.set(3, 0.1, 0);
        this.wings[0].unitX.set(Math.cos(wa), -Math.sin(wa), Math.sin(wa2));
        this.wings[0].unitY.set(Math.sin(wa), Math.cos(wa), 0);
        this.wings[0].zVel.set(0, 0, 1);

        // 　左翼???
        this.wings[1].position.set(-3, 0.1, 0);
        this.wings[1].unitX.set(Math.cos(wa), Math.sin(wa), -Math.sin(wa2));
        this.wings[1].unitY.set(-Math.sin(wa), Math.cos(wa), 0);
        this.wings[1].zVel.set(0, 0, 1);

        // 水平尾翼
        this.wings[2].position.set(0, -10, 2);
        this.wings[2].unitX.set(1, 0, 0);
        this.wings[2].unitY.set(0, 1, 0);
        this.wings[2].zVel.set(0, 0, 1);

        // 垂直尾翼
        this.wings[3].position.set(0, -10, 0);
        this.wings[3].unitX.set(0, 0, 1);
        this.wings[3].unitY.set(0, 1, 0);
        this.wings[3].zVel.set(1, 0, 0);

        // 右エンジン
        this.wings[4].position.set(5, 0, 0);
        this.wings[4].unitX.set(1, 0, 0);
        this.wings[4].unitY.set(0, 1, 0);
        this.wings[4].zVel.set(0, 0, 1);

        // 左エンジン
        this.wings[5].position.set(-5, 0, 0);
        this.wings[5].unitX.set(1, 0, 0);
        this.wings[5].unitY.set(0, 1, 0);
        this.wings[5].zVel.set(0, 0, 1);

        // 各翼の質量をセット

        this.wings[0].mass = 400 / 2;
        this.wings[1].mass = 400 / 2;
        this.wings[2].mass = 50;
        this.wings[3].mass = 50;
        this.wings[4].mass = 300;
        this.wings[5].mass = 300;

        // 各翼の面積をセット

        this.wings[0].sVal = 60 / 2;
        this.wings[1].sVal = 60 / 2;
        this.wings[2].sVal = 2;
        this.wings[3].sVal = 2;
        this.wings[4].sVal = 0;
        this.wings[5].sVal = 0;

        // エンジンの推力をセット

        this.wings[0].tVal = 0.1;
        this.wings[1].tVal = 0.1;
        this.wings[2].tVal = 0.1;
        this.wings[3].tVal = 0.1;
        this.wings[4].tVal = 1000;
        this.wings[5].tVal = 1000;

        // 総質量と慣性モーメントを求めておく

        this.mass = 0;
        this.iMass.set(1000, 1000, 4000);
        let m_i = 1;
        for (let wing of this.wings) {
            this.mass += wing.mass;
            wing.aAngle = 0;
            wing.bAngle = 0;
            // wing.forward.set(0, 0, 1);
            this.iMass.x += wing.mass * (Math.abs(wing.position.x) + 1) * m_i * m_i;
            this.iMass.y += wing.mass * (Math.abs(wing.position.y) + 1) * m_i * m_i;
            this.iMass.z += wing.mass * (Math.abs(wing.position.z) + 1) * m_i * m_i;
        }
    }

    // 機体のローカル座標→ワールド座標変換行列を求める

    public checkTrans() {

        let x = this.rotation.x;
        let y = this.rotation.y;
        let z = this.rotation.z;
        this.sina = Math.sin(x); this.cosa = Math.cos(x);
        if (this.cosa < 1e-9 && this.cosa > 0) {
            this.cosa = 1e-9;
        }
        if (this.cosa > -1e-9 && this.cosa < 0) {
            this.cosa = -1e-9;
        }

        this.sinb = Math.sin(y); this.cosb = Math.cos(y);
        this.sinc = Math.sin(z); this.cosc = Math.cos(z);


        // ピッチ（機首の上下）→ロール（左右の傾き）→ヨー(地面垂直方向)
        let a = new THREE.Euler(x, -y, z, "YXZ");

        this.matrix.makeRotationFromEuler(a);
    }

    // ワールド座標を機体座標へ変換する（１次変換のみ）

    public change_w2l(pw: THREE.Vector3, pl: THREE.Vector3) {

        pl.x = pw.x * this.matrix.elements[0] + pw.y * this.matrix.elements[4] + pw.z * this.matrix.elements[8];
        pl.y = pw.x * this.matrix.elements[1] + pw.y * this.matrix.elements[5] + pw.z * this.matrix.elements[9];
        pl.z = pw.x * this.matrix.elements[2] + pw.y * this.matrix.elements[6] + pw.z * this.matrix.elements[10];
    }

    // 機体座標をワールド座標へ変換する（１次変換のみ）

    public change_l2w(pl: THREE.Vector3, pw: THREE.Vector3) {

        pw.x = pl.x * this.matrix.elements[0] + pl.y * this.matrix.elements[1] + pl.z * this.matrix.elements[2];
        pw.y = pl.x * this.matrix.elements[4] + pl.y * this.matrix.elements[5] + pl.z * this.matrix.elements[6];
        pw.z = pl.x * this.matrix.elements[8] + pl.y * this.matrix.elements[9] + pl.z * this.matrix.elements[10];
    }


    // 機銃やミサイルのロック処理

    public lockCheck(world: Jflight) {
        let a = new THREE.Vector3();
        let b = new THREE.Vector3();
        let nno = new Array<number>(Plane.MMMAX);       // 機体No.
        let dis = new Array<number>(Plane.MMMAX); // 機体と自機との距離

        for (let m = 0; m < Plane.MMMAX; m++) {
            dis[m] = 1e30;
            nno[m] = -1;
        }

        for (let m = 0; m < Jflight.PMAX; m++) {

            // 目標が存在していればロックリストに追加
            if (m !== this.no && world.plane[m].use) {

                // 目標との距離を求める
                //a.setMinus(<any>this.position, <any>world.plane[m].position);
                a.subVectors(this.position, world.plane[m].position);
                //let near_dis = a.abs2();
                let near_dis = a.lengthSq();

                if (near_dis < 1e8) {

                    // 目標との位置関係を機体座標系に変換
                    this.change_w2l(a, b);

                    // 武器サークル内ならロック
                    if (b.y <= 0 && Math.sqrt(b.x * b.x + b.z * b.z) < -b.y * 0.24) {

                        // 既にロックされているのなら、他のロックと近い順に置き換える
                        for (let m1 = 0; m1 < Plane.MMMAX; m1++) {
                            if (near_dis < dis[m1]) {
                                for (let m2 = Plane.MMMAX - 1; m2 > m1; m2--) {
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

        // ロック目標が見つからない場合、一番近い目標にロック

        for (let m1 = 1; m1 < 4; m1++) {
            if (nno[m1] < 0) {
                nno[m1] = nno[0];
                dis[m1] = dis[0];
            }
        }

        // ４以降のミサイルは、同一ポッドのミサイルに合わせる

        for (let m1 = 4; m1 < Plane.MMMAX; m1++) {
            nno[m1] = nno[m1 % 4];
            dis[m1] = dis[m1 % 4];
        }

        for (let m1 = 0; m1 < Plane.MMMAX; m1++) {
            this.aamTarget[m1] = nno[m1];
        }

        // 機銃の目標（主目標）は、最も近い敵機にセット
        this.gunTarget = nno[0];
        this.targetDis = Math.sqrt(dis[0]);
    }

    // 機体を動かす
    // 自機の弾丸なども移動

    public move(world: Jflight, autof: boolean) {

        this.checkTrans();           // 座標変換用の行列再計算
        this.lockCheck(world);       // ミサイルロック処理

        if (this.no === 0 && !autof) {  // 手動操縦
            this.keyScan(world);
        } else {
            this.autoFlight(world);   // 自動操縦
        }

        this.moveCalc(world);
        this.moveBullet(world);
        this.moveAam(world);
    }

    // キー状態をもとに、スティックやトリガーをセット
    // 実際のキースキャンを処理しているのは、Applet3Dクラス

    protected keyScan(world: Jflight) {
        this.stickVel.set(0, 0, 0);
        this.boost = false;
        this.gunShoot = keyboard.pressed("space"); // world.keyShoot;
        this.aamShoot = keyboard.pressed("space"); // world.keyShoot;

        if (keyboard.pressed("b")) {
            this.boost = true;
        }

        // スティックを急激に動かすとまずいので、
        // スティック自身に慣性を持たせて滑らかに動かしている。

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

        // マウス処理
        if (world.isMouseMove) {
            let dx = this.stickPos.x - Jflight.mouseY;
            let dy = this.stickPos.y + Jflight.mouseX;
            this.stickVel.x = dx;
            this.stickVel.y = dy;

            // let length = this.stickVel.abs();
            //if (length >= 1) {
            //    this.stickVel.x /= length;
            //    this.stickVel.y /= length;
            //}
            // world.isMouseMove = false;
        }

        // this.stickPos.addCons(this.stickVel, this.stickA);
        this.stickPos.addScaledVector(<any>this.stickVel, this.stickA);
        // this.stickPos.subCons(this.stickPos, this.stickR);
        this.stickPos.addScaledVector(this.stickPos, -this.stickR);

        // スティック位置を距離１以内に丸めておく

        let r = Math.sqrt(this.stickPos.x * this.stickPos.x + this.stickPos.y * this.stickPos.y);
        if (r > 1) {
            this.stickPos.x /= r;
            this.stickPos.y /= r;
        }
    }

    // 機体計算

    public moveCalc(world: Jflight) {
        let ve;
        let dm = new THREE.Vector3();

        // 主目標の見かけの位置を求めておく（機銃の追尾で用いる）

        this.targetSx = -1000;
        this.targetSy = 0;
        if (this.gunTarget >= 0 && world.plane[this.gunTarget].use) {

            // 主目標の座標をスクリーン座標に変換
            world.change3d(this, world.plane[this.gunTarget].position, dm);

            // スクリーン内なら
            if (dm.x > 0 && dm.x < world.getWidth() && dm.y > 0 && dm.y < world.getHeight()) {
                this.targetSx = dm.x;
                this.targetSy = dm.y;
            }
        }

        // 自機の位置から、地面の高さを求め、高度を求める

        this.gHeight = world.gHeight(this.position.x, this.position.y);
        this.height = this.position.z - this.gHeight;

        // 空気密度の計算

        if (this.position.z < 5000) {
            ve = 0.12492 - 0.000008 * this.position.z;
        } else {
            ve = (0.12492 - 0.04) - 0.000002 * (this.position.z - 5000);
        }
        if (ve < 0) {
            ve = 0;
        }

        // 各翼を操縦系に合わせてひねっておく

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

        this.change_w2l(<any>this.velocity, <any>this.localVelocity);
        this.onGround = false;

        if (this.height < 5) {
            this.onGround = true;
        }

        // af→機体にかかる力
        // am→機体にかかるモーメント

        let af = new THREE.Vector3();//new CVector3();
        let am = new THREE.Vector3();//new CVector3();
        // af.set(0, 0, 0);
        // am.set(0, 0, 0);

        // 各翼に働く力とモーメントを計算

        this.aoa = 0;
        let i = 0;
        let v = new THREE.Vector3();
        for (let wing of this.wings) {
            wing.calc(this, ve, i, this.boost);
            ++i;

            // 力
            af.x += (wing.fVel.x * this.matrix.elements[0] + wing.fVel.y * this.matrix.elements[1] + wing.fVel.z * this.matrix.elements[2]);
            af.y += (wing.fVel.x * this.matrix.elements[4] + wing.fVel.y * this.matrix.elements[5] + wing.fVel.z * this.matrix.elements[6]);
            af.z += (wing.fVel.x * this.matrix.elements[8] + wing.fVel.y * this.matrix.elements[9] + wing.fVel.z * this.matrix.elements[10]) + wing.mass * Jflight.G;

            // モーメント（力と翼位置との外積）
            // am.x -= (wing.pVel.y * wing.fVel.z - wing.pVel.z * wing.fVel.y);
            // am.y -= (wing.pVel.z * wing.fVel.x - wing.pVel.x * wing.fVel.z);
            // am.z -= (wing.pVel.x * wing.fVel.y - wing.pVel.y * wing.fVel.x);


            // v = position × velocity
            // am -= v;
            v.crossVectors(wing.position, wing.fVel);
            am.sub(v);
        }

        // 角度変化を積分

        this.vaVel.x += am.x / this.iMass.x * Jflight.DT;
        this.vaVel.y += am.y / this.iMass.y * Jflight.DT;
        this.vaVel.z += am.z / this.iMass.z * Jflight.DT;


        //let rotX = (this.vaVel.x * this.cosb + this.vaVel.z * this.sinb) * Jflight.DT;
        //let rotY = (this.vaVel.y + (this.vaVel.x * this.sinb - this.vaVel.z * this.cosb) * this.sina / this.cosa) * Jflight.DT;
        //let rotZ = (-this.vaVel.x * this.sinb + this.vaVel.z * this.cosb) / this.cosa * Jflight.DT;


        this.rotation.x += (this.vaVel.x * this.cosb + this.vaVel.z * this.sinb) * Jflight.DT;
        this.rotation.y += (this.vaVel.y + (this.vaVel.x * this.sinb - this.vaVel.z * this.cosb) * this.sina / this.cosa) * Jflight.DT;
        this.rotation.z += (-this.vaVel.x * this.sinb + this.vaVel.z * this.cosb) / this.cosa * Jflight.DT;

        // 機体の角度を一定範囲に丸めておく
        for (let q = 0; q < 3 && this.rotation.x >= Math.PI / 2; q++) {
            this.rotation.x = Math.PI - this.rotation.x;
            this.rotation.y += Math.PI;
            this.rotation.z += Math.PI;
        }
        for (let q = 0; q < 3 && this.rotation.x < -Math.PI / 2; q++) {
            this.rotation.x = -Math.PI - this.rotation.x;
            this.rotation.y += Math.PI;
            this.rotation.z += Math.PI;
        }

        for (let q: number = 0; q < 3 && this.rotation.y >= Math.PI; q++) {
            this.rotation.y -= Math.PI * 2;
        }
        for (let q = 0; q < 3 && this.rotation.y < -Math.PI; q++) {
            this.rotation.y += Math.PI * 2;
        }
        for (let q = 0; q < 3 && this.rotation.z >= Math.PI * 2; q++) {
            this.rotation.z -= Math.PI * 2;
        }
        for (let q = 0; q < 3 && this.rotation.z < 0; q++) {
            this.rotation.z += Math.PI * 2;
        }

        // 加速度を決定

        // this.gVel.setConsInv(af, this.mass);
        this.gVel.copy(af);
        this.gVel.multiplyScalar(1 / this.mass);

        // 機体で発生する抵抗を擬似的に生成

        let _v = new THREE.Vector3();//new CVector3()
        _v.copy(this.velocity);
        _v.normalize();

        this.velocity.x -= this.velocity.x * this.velocity.x * 0.00002 * _v.x;
        this.velocity.y -= this.velocity.y * this.velocity.y * 0.00002 * _v.y;
        this.velocity.z -= this.velocity.z * this.velocity.z * 0.00002 * _v.z;

        // 地面の傾き処理

        world.gGrad(this.position.x, this.position.y, dm);
        if (this.onGround) {
            this.gVel.x -= dm.x * 10;
            this.gVel.y -= dm.y * 10;
            let vz = dm.x * this.velocity.x + dm.y * this.velocity.y;
            if (this.velocity.z < vz) {
                this.velocity.z = vz;
            }
        }

        // ブースト時には、機体を振動させる

        if (this.boost) {
            this.gVel.x += (Math.random() - 0.5) * 5;
            this.gVel.y += (Math.random() - 0.5) * 5;
            this.gVel.z += (Math.random() - 0.5) * 5;
        }

        // 機体の位置を積分して求める

        // this.velocity.addCons(this.gVel, Jflight.DT);
        this.velocity.addScaledVector(this.gVel, Jflight.DT);

        // this.position.addCons(this.velocity, Jflight.DT);
        this.position.addScaledVector(this.velocity, Jflight.DT);

        // 念のため、地面にめり込んだかどうかチェック
        if (this.height < 2) {
            this.position.z = this.gHeight + 2;
            this.height = 2;
            this.velocity.z *= -0.1;
        }

        // 地面にある程度以上の速度か、無理な体勢で接触した場合、機体を初期化
        if (this.height < 5 && (Math.abs(this.velocity.z) > 50 || Math.abs(this.rotation.y) > 20 * Math.PI / 180 || this.rotation.x > 10 * Math.PI / 180)) {
            this.posInit();
        }


        //
        this.line.setRotationFromMatrix(this.matrix);
    }

    // 自動操縦

    public autoFlight(world: Jflight) {
        let m, mm;

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

        let dm_p = new THREE.Vector3();
        let dm_a = new THREE.Vector3();

        // 目標と自機の位置関係を求め、機体座標に変換しておく
        //dm_p.setMinus(<any>this.position, <any>world.plane[this.target].position);
        dm_p.subVectors(this.position, world.plane[this.target].position);
        this.change_w2l(dm_p, dm_a);

        // mmは、スティックの移動限界量

        if (this.level >= 20) {
            mm = 1;
        } else {
            mm = (this.level + 1) * 0.05;
        }

        this.stickVel.x = 0;
        this.stickVel.y = 0;
        m = Math.sqrt(dm_a.x * dm_a.x + dm_a.z * dm_a.z);

        // スロットルの位置は、目標にあわせる

        if (this.level > 8 && this.gunTime < 1) {
            this.power = world.plane[this.target].power;
        } else {
            this.power = 9;
        }

        // 目標が上方に見える場合、スティックを引く
        if (dm_a.z < 0) {
            this.stickVel.x = dm_a.z / m * mm;
        }

        // 目標の左右見かけ位置に合わせて、スティックを左右に動かす
        this.stickVel.y = -dm_a.x / m * mm * 0.4;

        if (this.stickVel.y > 1) {
            this.stickVel.y = 1;
        }
        if (this.stickVel.y < -1) {
            this.stickVel.y = -1;
        }

        // スティックの慣性処理
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

        // 機体高度が低いか、8秒以内に地面にぶつかりそうな場合、空に向ける
        if (this.height < 1000 || this.height + this.velocity.z * 8 < 0) {
            this.stickPos.y = -this.rotation.y;
            if (Math.abs(this.rotation.y) < Math.PI / 2) {
                this.stickPos.x = -1;
            } else {
                this.stickPos.x = 0;
            }
        }

        // スティック位置を１以内に丸めておく

        m = Math.sqrt(this.stickPos.x * this.stickPos.x + this.stickPos.y * this.stickPos.y);
        if (m > mm) {
            this.stickPos.x *= mm / m;
            this.stickPos.y *= mm / m;
        }

        // 主目標として選ばれているのなら、機銃を撃つ
        if (this.gunTarget === this.target && this.gunTime < 1) {
            // 機銃がオーバーヒートしている場合、温度が下がるまで待つ
            if (!this.heatWait && this.gunTemp < Plane.MAXT - 1) {
                this.gunShoot = true;
            } else {
                this.heatWait = true;
            }
        }

        if (this.gunTemp < 2) {
            this.heatWait = false;
        }
        // 主目標として選ばれているのなら、ミサイルを撃つ

        if (this.gunTarget === this.target) {
            this.aamShoot = true;
        }

        // 失速しそうな場合、スティックを離す

        if (Math.abs(this.aoa) > 0.35) {
            this.stickPos.x = 0;
        }
    }

    // 機銃の弾丸移動と発射処理

    public moveBullet(world: Jflight) {
        // let aa;

        let sc = new THREE.Vector3();
        let a = new THREE.Vector3();
        let b = new THREE.Vector3();
        let c = new THREE.Vector3();
        let dm = new THREE.Vector3();
        let oi = new THREE.Vector3();
        let ni = new THREE.Vector3();

        // 弾丸の初期速度を求めておく
        dm.set(this.gunX * 400 / 200, 400, this.gunY * 400 / 200);
        this.change_l2w(dm, oi);
        oi.add(<any>this.velocity);
        this.gunTime = 1.0;

        // 弾丸の初期位置を求めておく
        dm.set(4 * 2, 10.0, 4 * -0.5);
        this.change_l2w(dm, ni);

        // 弾丸の到達予想時間を求めておく
        if (this.gunTarget >= 0)
            this.gunTime = this.targetDis / (/*oi.abs()*/oi.length() * 1.1);
        if (this.gunTime > 1.0)
            this.gunTime = 1.0;

        // 弾丸の到着予想位置を求める
        this.gcVel.x = this.position.x + ni.x + (oi.x - this.gVel.x * this.gunTime) * this.gunTime;
        this.gcVel.y = this.position.y + ni.y + (oi.y - this.gVel.y * this.gunTime) * this.gunTime;
        this.gcVel.z = this.position.z + ni.z + (oi.z + (-9.8 - this.gVel.z) * this.gunTime / 2) * this.gunTime;

        world.change3d(this, <any>this.gcVel, sc);

        // 機銃を目標へ向ける
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
            let xx = (this.targetSx - sc.x);
            let yy = (this.targetSy - sc.y);
            let mm = Math.sqrt(xx * xx + yy * yy);
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

        // 機銃稼働限界内かチェック

        let y = this.gunY - 20;
        let r = Math.sqrt(this.gunX * this.gunX + this.gunY * this.gunY);
        if (r > 100) {
            let x = this.gunX;
            x *= 100 / r;
            y *= 100 / r;
            this.gunX = x;
            this.gunY = y + 20;
            this.gunVx = 0;
            this.gunVy = 0;
        }

        // 弾丸移動
        for (let bullet of this.bullets) {
            if (bullet.use !== 0) {
                bullet.move(world, this);
            }
        }

        // 弾丸発射処理
        if (this.gunShoot && this.gunTemp++ < Plane.MAXT) {
            for (let i = 0; i < Plane.BMAX; i++) {
                if (this.bullets[i].use === 0) {
                    // this.bullets[i].velocity.setPlus(this.velocity, oi);
                    this.bullets[i].velocity.addVectors(this.velocity, <any>oi);
                    let aa = Math.random();

                    // this.bullets[i].position.setPlus(this.position, ni);
                    this.bullets[i].position.addVectors(this.position, <any>ni);

                    // this.bullets[i].position.addCons(this.bullets[i].velocity, 0.1 * aa);
                    this.bullets[i].position.addScaledVector(<any>this.bullets[i].velocity, 0.1 * aa);

                    this.bullets[i].oldPosition.set(this.bullets[i].position.x, this.bullets[i].position.y, this.bullets[i].position.z);
                    this.bullets[i].bom = 0;
                    this.bullets[i].use = 15;
                    break;
                }
            }
        } else if (this.gunTemp > 0) {
            this.gunTemp--;
        }
    }

    // ミサイル移動と発射処理

    public moveAam(world: Jflight) {
        let dm = new THREE.Vector3();
        let ni = new THREE.Vector3();
        let oi = new THREE.Vector3();

        for (let k = 0; k < Plane.MMMAX; k++) {

            // 各ミサイル移動
            if (this.aam[k].use > 0) {
                this.aam[k].move(world, this);
            }

            // タイムアウトしたら消去
            if (this.aam[k].use === 0)
                this.aam[k].use = -1;
        }

        // ミサイル発射処理
        // ただし、目標が近すぎると撃てない

        if (this.aamShoot && this.targetDis > 50) {

            // 使われていないミサイルを探す

            let k;
            for (k = 0; k < Plane.MMMAX; k++) {
                if (this.aam[k].use < 0 && this.aamTarget[k] >= 0) {
                    break;
                }
            }

            if (k !== Plane.MMMAX) {
                let ap = this.aam[k];

                //  発射位置を決める

                switch (k % 4) {
                    case 0: dm.x = 6; dm.z = 1; break;
                    case 1: dm.x = -6; dm.z = 1; break;
                    case 2: dm.x = 6; dm.z = -1; break;
                    case 3: dm.x = -6; dm.z = -1; break;
                }
                dm.y = 2;
                this.change_l2w(dm, ni);

                //  発射速度を決める

                let v2 = 0;
                let v3 = 5;
                let vx = Math.random() * v3;
                let vy = Math.random() * v3;
                v2 *= (k / 4) + 1;
                vx *= (k / 4) + 1;
                vy *= (k / 4) + 1;
                switch (k % 4) {
                    case 0: dm.x = vx; dm.z = vy - v2; break;
                    case 1: dm.x = -vx; dm.z = vy - v2; break;
                    case 2: dm.x = vx; dm.z = -vy - v2; break;
                    case 3: dm.x = -vx; dm.z = -vy - v2; break;
                }
                dm.y = 40;
                this.change_l2w(dm, oi);

                // ap.position.setPlus(this.position, ni);
                ap.position.addVectors(this.position, <any>ni);

                // ap.velocity.setPlus(this.velocity, oi);
                ap.velocity.addVectors(this.velocity, <any>oi);

                // 発射向きを決める

                switch (k % 4) {
                    case 0: dm.x = 8; dm.z = 1 + 10; break;
                    case 1: dm.x = -8; dm.z = 1 + 10; break;
                    case 2: dm.x = 5; dm.z = -1 + 10; break;
                    case 3: dm.x = -5; dm.z = -1 + 10; break;
                }
                dm.y = 50.0;
                dm.z += (k / 4) * 5;
                this.change_l2w(dm, oi);
                //let v = oi.abs();
                let v = oi.length();
                // ap.forward.setConsInv(oi, v);
                ap.forward.copy(<any>oi);
                ap.forward.divideScalar(v);

                // 各種初期化

                ap.use = 100;
                ap.count = 0;
                ap.bom = 0;
                ap.targetNo = this.aamTarget[k];
            }
        }
    }

}
