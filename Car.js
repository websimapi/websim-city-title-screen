// Inside pickNewTarget in Car.js
// ...
const nextPos = this.position.clone().add(bestDir);
if (nextPos.x >= 0 && nextPos.x <= limit && nextPos.z >= 0 && nextPos.z <= limit) {
    this.target = nextPos;
} else {
    // invert direction or pick another
    // for mvp just turn around
    this.target = this.position.clone().sub(bestDir);
}