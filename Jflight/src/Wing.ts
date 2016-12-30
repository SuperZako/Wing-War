//
// Wing
// 翼クラス
//
// 翼についたエンジンも表す
//

class Wing extends PhysicsState {

    //        座標系
    //     Z
    //     ^  Y
    //     | /
    //     |/
    //     -------->X

    // 変数
    public unitX = new THREE.Vector3();   // 翼座標Ｘ単位ベクトル（機体座標）
    public unitY = new THREE.Vector3();   // 翼座標Ｙ単位ベクトル（機体座標）
    public zVel = new THREE.Vector3();   // 翼座標Ｚ単位ベクトル（機体座標）
    public mass: number;      // 翼の質量
    public sVal: number;      // 翼面積
    public fVel = new THREE.Vector3();    // 翼にかかっている力
    public aAngle: number;    // 翼のＸ軸ひねり角度（rad）
    public bAngle: number;    // 翼のＹ軸ひねり角度（rad）

    // public forward: CVector3;    // 翼のひねりを考慮したＹ単位ベクトル（機体座標）

    public tVal: number;      // エンジンの推力（0で通常の翼）

    // コンストラクタ
    public constructor() {
        super();
    }

    // 翼計算を行う
    // fVelに計算結果が求まる
    // veは空気密度、noは翼No.（迎角計算に使用）、boostはエンジンブースト
    public calc(plane: Plane, ve: number, no: number, boost: boolean): void {
        let cd, ff;

        // 機体の速度と回転率、翼の位置から翼における速度を求める（外積計算）
        let vp = new THREE.Vector3();
        // vp.x = plane.localVelocity.x + this.position.y * plane.vaVel.z - this.position.z * plane.vaVel.y;
        // vp.y = plane.localVelocity.y + this.position.z * plane.vaVel.x - this.position.x * plane.vaVel.z;
        // vp.z = plane.localVelocity.z + this.position.x * plane.vaVel.y - this.position.y * plane.vaVel.x;

        // vp = plane.localVelocity + this.position.x × plane.vaVel;
        vp.crossVectors(this.position, plane.vaVel);
        vp.add(plane.localVelocity);

        // 翼のひねりを基に、基本座標ベクトルを回転

        let sin = Math.sin(this.bAngle);
        let cos = Math.cos(this.bAngle);

        let qx = new THREE.Vector3();
        // qx.x = this.unitX.x * cos - this.zVel.x * sin;
        // qx.y = this.unitX.y * cos - this.zVel.y * sin;
        // qx.z = this.unitX.z * cos - this.zVel.z * sin;
        // qx = this.unitX * cos - this.zVel * sin;
        qx.addScaledVector(this.unitX, cos);
        qx.addScaledVector(this.zVel, -sin);

        let qy = new THREE.Vector3();
        //this.m_qy.set(this.yVel.x, this.yVel.y, this.yVel.z);
        qy.copy(this.unitY);

        let qz = new THREE.Vector3();
        qz.x = this.unitX.x * sin + this.zVel.x * cos;
        qz.y = this.unitX.y * sin + this.zVel.y * cos;
        qz.z = this.unitX.z * sin + this.zVel.z * cos;

        sin = Math.sin(this.aAngle);
        cos = Math.cos(this.aAngle);

        // this.m_wx.set(this.m_qx.x, this.m_qx.y, this.m_qx.z);
        let wx = new THREE.Vector3();
        wx.copy(qx);

        let wy = new THREE.Vector3();
        wy.x = qy.x * cos - qz.x * sin;
        wy.y = qy.y * cos - qz.y * sin;
        wy.z = qy.z * cos - qz.z * sin;

        let wz = new THREE.Vector3();
        wz.x = qy.x * sin + qz.x * cos;
        wz.y = qy.y * sin + qz.y * cos;
        wz.z = qy.z * sin + qz.z * cos;

        let t0 = 0;

        this.fVel.set(0, 0, 0);

        if (this.sVal > 0) {

            // 翼計算

            // let vv = this.m_vp.abs();

            // 翼速度の単位ベクトルを求める(機体座標)
            // this.m_ti.x = this.m_vp.x / vv;
            // this.m_ti.y = this.m_vp.y / vv;
            // this.m_ti.z = this.m_vp.z / vv;

            let ti = new THREE.Vector3();
            ti.copy(vp);
            ti.normalize();

            // 機体座標の翼速度を翼座標系に変換

            // let dx = wx.x * vp.x + wx.y * vp.y + wx.z * vp.z;
            let dx = wx.dot(vp);
            // let dy = wy.x * vp.x + wy.y * vp.y + wy.z * vp.z;
            let dy = wy.dot(vp);
            let dz = wz.x * vp.x + wz.y * vp.y + wz.z * vp.z;

            // 揚力方向の速度成分を求める

            let rr = Math.sqrt(dx * dx + dy * dy);

            let vp2 = new THREE.Vector3();
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

            let ni = new THREE.Vector3();
            ni.x = wz.x * rr - vp2.x * dz;
            ni.y = wz.y * rr - vp2.y * dz;
            ni.z = wz.z * rr - vp2.z * dz;

            // vv = this.m_ni.abs();
            // this.m_ni.consInv(vv);
            let vv = ni.length();
            ni.normalize();

            // 迎角を求める

            let at = -Math.atan(dz / dy);

            if (no === 0) {
                plane.aoa = at;
            }

            let cl = 0;
            if (Math.abs(at) < 0.4) {
                //  揚力係数と抗力係数を迎角から求める
                cl = at * 4;
                cd = (at * at + 0.05);
            }
            else {
                //  迎角が0.4radを超えていたら失速
                cl = 0;
                cd = (0.4 * 0.4 + 0.05);
            }

            // 抗力を求める
            t0 = 0.5 * vv * vv * cd * ve * this.sVal;

            // 揚力を求める
            let n = 0.5 * rr * rr * cl * ve * this.sVal;

            this.fVel.x = n * ni.x - t0 * ti.x;
            this.fVel.y = n * ni.y - t0 * ti.y;
            this.fVel.z = n * ni.z - t0 * ti.z;
        }

        if (this.tVal > 0) {

            // 推力計算

            // 推力を求める
            if (boost) {
                ff = ((5 * 10) / 0.9) * ve * 4.8 * this.tVal;
            } else {
                ff = (plane.power / 0.9) * ve * 4.8 * this.tVal;
            }

            // 地面に近い場合、見かけの推力を上げる
            if (plane.height < 20)
                ff *= (1 + (20 - plane.height) / 40);

            // 推力を加える

            // this.fVel.addCons(this.m_wy, ff);
            this.fVel.addScaledVector(wy, ff);
        }
        // this.forward.set(this.m_wy.x, this.m_wy.y, this.m_wy.z);
    }

}