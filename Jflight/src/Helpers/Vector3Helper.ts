

namespace Vector3Helper {

    let result = new THREE.Vector3();
    export function cross(vector1: THREE.Vector3, vector2: THREE.Vector3) {
        return result.crossVectors(vector1, vector2);
    }
}