//
// bullet
// 弾丸クラス
//

class Bullet extends PhysicsState {

    // 変数
    public oldPosition = new THREE.Vector3();     // １ステップ前の位置

    public use = 0;               // 使用状態（0で未使用）
    public bom = 0;               // 爆発状態（0で未爆）

    // テンポラリ用オブジェクト

    // protected m_a = new CVector3();
    // protected m_b = new CVector3();
    // protected m_vv = new CVector3();

    private sphere: THREE.Mesh;
    // コンストラクタ

    public constructor(scene: THREE.Scene) {
        super();
        var geometry: THREE.SphereGeometry = new THREE.SphereGeometry(5, 8, 8);
        var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.sphere = new THREE.Mesh(geometry, material);
        this.sphere.visible = false;
        scene.add(this.sphere);
    }

    // 弾丸移動、敵機とのあたり判定、地面との当たり判定を行う
    // 弾丸発射処理はJflightクラス側で行われている

    public move(world: Jflight, plane: Plane) {

        // 重力加速
        this.velocity.z += Jflight.G * Jflight.DT;

        // 一つ前の位置を保存
        this.oldPosition.set(this.position.x, this.position.y, this.position.z);

        // 移動
        // this.position.addCons(this.velocity, Jflight.DT);
        this.position.addScaledVector(this.velocity, Jflight.DT);
        this.use--;

        // 弾丸を移動させる
        if (this.use > 0) {
            this.sphere.position.x = this.position.x;
            this.sphere.position.y = this.position.y;
            this.sphere.position.z = this.position.z;
            this.sphere.visible = true;
        } else {
            this.sphere.visible = false;
        }

        // 弾丸が爆発中の場合、爆円表示
        if (this.bom > 0) {
            // this.change3d(this.plane[0], bp.opVel, cp);
            // this.fillBarc(cp);
            this.bom--;
        }
        // 目標が定まっているのならターゲットとの当たり判定を行う
        // 目標以外との当たり判定は行わない

        if (plane.gunTarget > -1) {

            // 目標が存在している場合

            // ここでの当たり判定方法は、
            // 一つ前の位置と現在の位置との距離と
            // 一つ前の位置と目標の距離、現在の位置と目標の距離との和を比較することで
            // 行っている。弾丸速度が速いため、単に距離を求めても当たらない。
            // 点と直線の方程式で再接近距離を求めても良いが、面倒だったので手抜き 。

            // 現在の弾丸の位置と目標との差ベクトルを求める
            let a = new THREE.Vector3();
            // this.m_a.setMinus(<any>this.position, <any>world.plane[plane.gunTarget].position);
            a.subVectors(this.position, world.plane[plane.gunTarget].position);

            // 一つ前の弾丸の位置と目標との差ベクトルを求める
            let b = new THREE.Vector3();
            // this.m_b.setMinus(<any>this.oldPosition, <any>world.plane[plane.gunTarget].position);
            b.subVectors(this.oldPosition, world.plane[plane.gunTarget].position);

            // 一つ前の弾丸の位置と現在の弾丸の位置との差ベクトルを求める
            //this.m_vv.setCons(<any>this.velocity, Jflight.DT);
            let v = new THREE.Vector3();
            v.copy(this.velocity);
            v.multiplyScalar(Jflight.DT);

            //let v0 = this.m_vv.abs();
            let v0 = v.length();
            // let l = this.m_a.abs() + this.m_b.abs();
            let l = a.length() + b.length();

            if (l < v0 * 1.05) {
                // 命中
                this.bom = 1;  // 爆発表示用にセット
                this.use = 10; // 直ぐには消さないで跳ね飛ばす

                // 現在位置と一つ前の位置の中間位置方向の速度成分を足して跳ね飛ばす
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

        // 地面との当たり判定

        let gh = world.gHeight(this.position.x, this.position.y);
        if (this.position.z < gh) {
            // 地面以下なら、乱反射させる
            this.velocity.z = Math.abs(this.velocity.z);
            this.position.z = gh;
            this.velocity.x += (Math.random() - 0.5) * 50;
            this.velocity.y += (Math.random() - 0.5) * 50;
            this.velocity.x *= 0.5;
            this.velocity.y *= 0.5;
            this.velocity.z *= 0.1;
        }
    }
}
