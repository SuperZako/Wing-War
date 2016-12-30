namespace MathHelper {

    export const EpsilonDouble = 1e-6;

    export const Pi = Math.PI; // πの値を表します。

    export const PiOver2 = Math.PI / 2; // πを 2 で割った値 (π/2) を表します。

    export const PiOver4 = Math.PI / 4; // πを 4 で割った値 (π/4) を表します。

    export const TwoPi = Math.PI * 2; // pi の 2 倍の値を表します。


    export function toDegrees(radians: number) {
        // This method uses double precission internally,
        // though it returns single float
        // Factor = 180 / pi
        return radians * 180 / Pi;
    }

    export function toRadians(degrees: number) {
        // This method uses double precission internally,
        // though it returns single float
        // Factor = pi / 180
        return degrees * Pi / 180;
    }
}