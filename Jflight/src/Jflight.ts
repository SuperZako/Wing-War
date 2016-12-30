///<reference path="Applet3D.ts" />
///<reference path="Plane.ts" />

//
// Jflightクラス
//
// jflight用のアプレットクラス
// このクラスがjflight実行の起点
// Applet3Dから継承することで3D表示すると共に、
// Runnableインターフェイス継承でスレッドを用いる
//


//     機体座標系
//           Z
//           ^  X
//           | /
//           |/
//     Y<----

//     ワールド座標系
//     Z
//     ^  Y
//     | /
//     |/
//     -------->X


class Jflight extends Applet3D {

    // 定数宣言

    static FMAX = 10000;   // フィールドの大きさ
    static GSCALE = 16;       // フィールドの分割数
    static PMAX = 4;          // 機体の最大数
    static readonly G = -9.8;       // 重力加速度
    public static DT = 0.05;       // 計算ステップ幅

    // 変数
    public plane: Plane[] = [];                      // 各機体オブジェクトへの配列
    protected autoFlight = true;          // 自機（plane[0]）を自動操縦にするのか
    static obj: THREE.Vector3[][] = [];            // 機体の形状（三角形の集合）

    // テンポラリオブジェクト

    protected pos: THREE.Vector3[][] = [];                   // 地面表示の際のデータを蓄えておくためのTmp

    private hud: HUD;


    static mouseX: number;
    static mouseY: number;

    isMouseMove = false;

    // アプレットの構築

    public constructor(scene: THREE.Scene, private hudCanvas: HTMLCanvasElement) {
        super();

        // 機体形状の初期化
        this.objInit();

        // 不要なガーベッジコレクションを避けるために、
        // オブジェクトを初めに出来るだけ作っておく
        for (let i = 0; i < Jflight.PMAX; i++) {
            this.plane.push(new Plane(scene));
        }

        for (let j = 0; j < Jflight.GSCALE; j++) {
            this.pos.push([]);
            for (let i = 0; i < Jflight.GSCALE; i++) {
                this.pos[j].push(new THREE.Vector3());
            }
        }

        this.hud = new HUD(hudCanvas, this.plane[0]);

        // 各機体の設定
        this.plane[0].no = 0;
        this.plane[1].no = 1;
        this.plane[2].no = 2;
        this.plane[3].no = 3;
        this.plane[0].target = 2;
        this.plane[1].target = 2;
        this.plane[2].target = 1;
        this.plane[3].target = 1;
        this.plane[0].use = true;
        this.plane[1].use = true;
        this.plane[2].use = true;
        this.plane[3].use = true;
        this.plane[0].level = 20;
        this.plane[1].level = 10;
        this.plane[2].level = 20;
        this.plane[3].level = 30;
    }

    // アプレットの初期化
    // public init() {
    // }

    // アプレットの起動
    // public start() {
    // }

    // アプレットの停止
    // public stop() {
    // }

    // 機体形状の初期化

    protected objInit() {
        if (Jflight.obj.length !== 0) {
            return;
        }

        for (let j = 0; j < 20; j++) {
            Jflight.obj.push([]);
            for (let i = 0; i < 3; i++) {
                Jflight.obj[j].push(new THREE.Vector3());
            }
        }

        // 全て独立三角形で構成
        // 本当は各頂点を共有した方が早いがここでは表示周りを簡略化

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
    }

    // アプレットの表示
    // 実際の動作中はこちらではなく、run()の方で表示される

    public paint(context: CanvasRenderingContext2D) {
        this.draw(context);
    }

    // 画面表示

    public draw(context: CanvasRenderingContext2D) {

        // let width = this.width;
        // let height = this.height;
        // let centerX = width / 2;
        // let centerY = height / 2;

        // バックバッファクリア
        this.clear(context);

        // 自機の変換行列を念のため再計算しておく
        this.plane[0].checkTrans();

        // 地面表示
        // this.writeGround(context);

        // 機体表示
        // this.writePlane(context);

        this.hud.render(this.hudCanvas);
    }

    // メインループ

    public run() {
        // スペースキーが押されたら自動操縦OFF
        if (keyboard.pressed("space")) {
            this.autoFlight = false;
        }

        // 各機を移動
        this.plane[0].move(this, this.autoFlight);
        for (let i = 1; i < Jflight.PMAX; i++) {
            this.plane[i].move(this, true);
        }
    }

    public render(context: CanvasRenderingContext2D) {
        // カメラ位置を自機にセットして表示
        this.camerapos.set(this.plane[0].position.x, this.plane[0].position.y, this.plane[0].position.z);
        this.draw(context);
    }
    // 各機体を表示
    // 弾丸やミサイルもここで表示している

    writePlane(context: CanvasRenderingContext2D) {
        let s0 = new THREE.Vector3();
        let s1 = new THREE.Vector3();
        let s2 = new THREE.Vector3();

        for (let i = 0; i < Jflight.PMAX; i++) {
            if (this.plane[i].use) {

                this.writeGun(context, this.plane[i]);
                this.writeAam(context, this.plane[i]);

                //自機以外の機体を表示

                // 各機体のワーク用座標変換行列を再計算
                //this.plane[0].checkTransM(this.plane[i].aVel);
                let a = new THREE.Euler(this.plane[i].rotation.x, -this.plane[i].rotation.y, this.plane[i].rotation.z, 'YXZ');
                let m = new THREE.Matrix4();
                m.makeRotationFromEuler(a);
                m.transpose();
                if (i !== 0) {
                    for (let j = 0; j < 19; j++) {

                        // 各機のローカル座標からワールド座標に変換
                        // ＃本当はアフィン変換でまとめて変換するべし
                        // this.plane[0].change_ml2w(Jflight.obj[j][0], p0);
                        let p0 = Jflight.obj[j][0].clone();
                        p0.applyMatrix4(m);

                        // this.plane[0].change_ml2w(Jflight.obj[j][1], p1);
                        let p1 = Jflight.obj[j][1].clone();
                        p1.applyMatrix4(m);

                        // this.plane[0].change_ml2w(Jflight.obj[j][2], p2);
                        let p2 = Jflight.obj[j][2].clone();
                        p2.applyMatrix4(m);

                        p0.add(this.plane[i].position);
                        p1.add(this.plane[i].position);
                        p2.add(this.plane[i].position);

                        // ワールド座標を、スクリーン座標に変換
                        this.change3d(this.plane[0], p0, s0);
                        this.change3d(this.plane[0], p1, s1);
                        this.change3d(this.plane[0], p2, s2);

                        // 三角形表示
                        this.drawPoly(context, s0, s1, s2);
                    }
                }
            }
        }
    }

    // 機銃を表示

    protected writeGun(context: CanvasRenderingContext2D, aplane: Plane) {
        let dm = new THREE.Vector3();
        let dm2 = new THREE.Vector3();
        let cp = new THREE.Vector3();

        for (let j = 0; j < Plane.BMAX; j++) {
            let bp = aplane.bullets[j];

            // useカウンタが0より大きいもののみ表示
            if (bp.use > 0) {

                // 弾丸の位置とその速度からラインを表示

                // スクリーンに近い場合、太線部も表示
                if (cp.z < 400) {

                    // 0.005秒後～0.04秒後の弾丸位置をライン表示
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

                // 現在位置～0.05秒後の弾丸位置をライン表示
                this.change3d(this.plane[0], <any>bp.position, cp);
                dm.x = bp.position.x + bp.velocity.x * 0.05;
                dm.y = bp.position.y + bp.velocity.y * 0.05;
                dm.z = bp.position.z + bp.velocity.z * 0.05;
                this.change3d(this.plane[0], dm, dm2);
                this.drawBlined(context, cp, dm2);
            }

            // 弾丸が爆発中の場合、爆円表示
            if (bp.bom > 0) {
                this.change3d(this.plane[0], <any>bp.oldPosition, cp);
                this.fillBarc(cp);
                bp.bom--;
            }
        }
    }

    // ミサイルとその煙を表示

    protected writeAam(context: CanvasRenderingContext2D, aplane: Plane) {
        let dm = new THREE.Vector3();
        let cp = new THREE.Vector3();
        for (let j = 0; j < Plane.MMMAX; j++) {
            let ap = aplane.aam[j];

            // useカウンタが0より大きいもののみ表示
            if (ap.use >= 0) {

                // ミサイルが爆発中でなければ、ミサイル本体を表示
                if (ap.bom <= 0) {
                    dm.x = ap.position.x + ap.forward.x * 4;
                    dm.y = ap.position.y + ap.forward.y * 4;
                    dm.z = ap.position.z + ap.forward.z * 4;
                    this.change3d(this.plane[0], dm, cp);
                    this.change3d(this.plane[0], <any>ap.position, dm);
                    this.drawAline(cp, dm);
                }

                // ミサイルの煙を表示
                // 煙の座標はリングバッファに格納されている
                let k = (ap.use + Missile.MOMAX + 1) % Missile.MOMAX;
                this.change3d(this.plane[0], <any>ap.oldPositions[k], dm);
                for (let m = 0; m < ap.count; m++) {
                    this.change3d(this.plane[0], <any>ap.oldPositions[k], cp);
                    this.drawMline(context, dm, cp);
                    k = (k + Missile.MOMAX + 1) % Missile.MOMAX;
                    dm.set(cp.x, cp.y, cp.z);
                }
            }

            // ミサイルが爆発中の場合、爆円表示
            if (ap.bom > 0) {
                this.change3d(this.plane[0], <any>ap.position, cp);
                this.fillBarc(cp);
            }
        }
    }

    // 地面を表示

    writeGround(context: CanvasRenderingContext2D) {

        let mx, my;
        let i: number, j: number;
        let p = new THREE.Vector3();

        // 地面グリッドの大きさを計算

        let step = Jflight.FMAX * 2 / Jflight.GSCALE;

        // 自機のグリッド位置とオフセットを計算

        let dx = (this.plane[0].position.x / step);
        let dy = (this.plane[0].position.y / step);
        let sx = dx * step;
        let sy = dy * step;

        // 各グリッド点をスクリーン座標に変換
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

        // 直交格子を表示
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
    }

    // 地面の高さを計算

    public gHeight(_px: number, _py: number) {
        return 0;
    }

    // 地面の傾きを計算

    public gGrad(_px: number, _py: number, p: THREE.Vector3) {
        p.x = 0;
        p.y = 0;
    }

}
