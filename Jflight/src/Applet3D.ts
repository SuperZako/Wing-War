//
// Applet3Dクラス
//
// ３Ｄ表示を支援するためのクラス
// 主に３Ｄ→２Ｄ変換と、キースキャンや各イベント管理を行う
//

class Applet3D {
    protected width: number;
    protected height: number;        // スクリーンの大きさ
    protected sCenterX: number;
    protected sCenterY: number;     // スクリーンのセンター座標

    public camerapos: THREE.Vector3;         // カメラの位置

    bWidth: number; bHeight: number;                  // バックバッファの大きさ、リサイズ時にスクリーンの大きさにあわせる


    // keyShoot: boolean;                     // スペースキーの状態h
    // keyLeft: boolean;                      // 左カーソルキーの状態
    // keyRight: boolean;                     // 右カーソルキーの状態
    // keyUp: boolean;                        // 上カーソルキーの状態
    // keyDown: boolean;                      // 下カーソルキーの状態
    // keyBoost: boolean;                     // B（ブースト）キーの状態

    // コンストラクタ

    public constructor() {
        this.camerapos = new THREE.Vector3();
        this.width = 600;
        this.height = 400;
        this.sCenterX = 300;
        this.sCenterY = 200;
        try {
            // this.jbInit();
        } catch (e) {
            // e.printStackTrace();
        }
        this.bgInit();
    }

    public setWidth(width: number) {
        this.width = width;
        this.sCenterX = width / 2;
    }

    public getWidth() {
        return this.width;
    }

    public setHeight(heihgt: number) {
        this.height = heihgt;
        this.sCenterY = heihgt / 2;
    }

    public getHeight() {
        return this.height;
    }

    // バックバッファの初期化
    public bgInit() {
    }

    // バックバッファのクリア

    public clear(context: CanvasRenderingContext2D) {

        context.clearRect(0, 0, this.width, this.height);

    }

    // ３Ｄ（sp）→２Ｄ（cp）変換
    // 変換にはPlaneオブジェクトの変換行列を用いている

    change3d(plane: Plane, sp: THREE.Vector3, cp: THREE.Vector3) {

        // 視点座標に平行移動後、変換行列を掛ける

        let x = sp.x - this.camerapos.x;
        let y = sp.y - this.camerapos.y;
        let z = sp.z - this.camerapos.z;

        let x1 = x * plane.matrix.elements[0] + y * plane.matrix.elements[4] + z * plane.matrix.elements[8];
        let y1 = x * plane.matrix.elements[1] + y * plane.matrix.elements[5] + z * plane.matrix.elements[9];
        let z1 = x * plane.matrix.elements[2] + y * plane.matrix.elements[6] + z * plane.matrix.elements[10];

        if (y1 > 10) {
            // 奥行きで割ってスクリーン座標に変換
            y1 /= 10;
            cp.x = x1 * 50 / y1 + this.sCenterX;
            cp.y = -z1 * 50 / y1 + this.sCenterY;
            cp.z = y1 * 10;
        } else {
            // 変換後の奥行き（y1）が10以下ならクリップ
            cp.x = -10000;
            cp.y = -10000;
            cp.z = 1;
        }
    }

    // 地面と機体表示用のライン表示

    public drawSline(context: CanvasRenderingContext2D, p0: THREE.Vector3, p1: THREE.Vector3) {
        if (p0.x > -10000 && p0.x < 30000 && p0.y > -10000 && p0.y < 30000 &&
            p1.x > -10000 && p1.x < 30000 && p1.y > -10000 && p1.y < 30000) {
            context.strokeStyle = "white";
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.stroke();
        }
    }

    // 弾丸表示用のライン表示

    public drawBlined(context: CanvasRenderingContext2D, p0: THREE.Vector3, p1: THREE.Vector3) {
        if (p0.x > -1000 && p1.x > -1000) {
            // bGraphics.setColor(Color.yellow);
            context.strokeStyle = "yellow";
            // bGraphics.drawLine((int)p0.x, (int)p0.y, (int)p1.x, (int)p1.y);
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.stroke();
        }
    }

    // 弾丸表示用の太いライン表示

    public drawBline(context: CanvasRenderingContext2D, p0: THREE.Vector3, p1: THREE.Vector3) {
        if (p0.x > -1000 && p1.x > -1000) {
            //bGraphics.setColor(Color.yellow);
            context.strokeStyle = "yellow";

            //bGraphics.drawLine(p0.x, (int)p0.y, (int)p1.x, (int)p1.y);
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.stroke();

            //bGraphics.drawLine(p0.x + 1, (int)p0.y, (int)p1.x + 1, (int)p1.y);
            //bGraphics.drawLine(p0.x, (int)p0.y + 1, (int)p1.x, (int)p1.y + 1);
            //bGraphics.drawLine(p0.x + 1, (int)p0.y + 1, (int)p1.x + 1, (int)p1.y + 1);
        }
    }

    // ミサイル煙用のライン表示

    public drawMline(context: CanvasRenderingContext2D, p0: THREE.Vector3, p1: THREE.Vector3) {
        if (p0.x > -1000 && p1.x > -1000) {
            // bGraphics.setColor(Color.lightGray);
            context.strokeStyle = "lightgrey";

            // bGraphics.drawLine(p0.x, p0.y, p1.x, p1.y);
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.stroke();
        }
    }

    // ミサイル用のライン表示

    public drawAline(p0: THREE.Vector3, p1: THREE.Vector3) {
        if (p0.x > -1000 && p1.x > -1000) {
            //bGraphics.setColor(Color.white);
            //bGraphics.drawLine(p0.x, (int)p0.y, (int)p1.x, (int)p1.y);
            //bGraphics.drawLine(p0.x + 1, (int)p0.y, (int)p1.x + 1, (int)p1.y);
            //bGraphics.drawLine(p0.x, (int)p0.y + 1, (int)p1.x, (int)p1.y + 1);
            //bGraphics.drawLine(p0.x + 1, (int)p0.y + 1, (int)p1.x + 1, (int)p1.y + 1);
        }
    }

    // ポリゴン表示

    public drawPoly(context: CanvasRenderingContext2D, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3) {
        this.drawSline(context, p0, p1);
        this.drawSline(context, p1, p2);
        this.drawSline(context, p2, p0);
    }

    // 爆発用の円表示

    public fillBarc(p: THREE.Vector3) {
        if (p.x >= -100) {
            // Ｚ座標値で半径を変える

            let rr = (2000 / p.z) + 2;
            if (rr > 40)
                rr = 40;
            // bGraphics.setColor(Color.orange);

            // bGraphics.fillArc(p.x, p.y, rr, rr, 0, 360);
        }
    }

    public fillText(context: CanvasRenderingContext2D, text: string, x: number, y: number) {

        context.font = "18px 'ＭＳ Ｐゴシック'";
        context.fillStyle = "white";
        context.fillText(text, x, y);

    }

    public drawLine(context: CanvasRenderingContext2D, strokeStyle: string, x1: number, y1: number, x2: number, y2: number) {

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

    }
}


