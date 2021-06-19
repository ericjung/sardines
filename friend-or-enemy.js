class FriendOrEnemy {
    // {name, points, speed, spawnInterval, scale, ydelta, infoSpacing, condition}
    constructor(props) {
        for (const k in props) {
            // custom method
            if (k === "condition") {
                this.condition = props[k].bind(this);
            }
            else {
                // properties/fields
                this[k] = props[k];
            }
        }

        this.count = 0; // don't think we need this.
        this.orientation = null;
        this.timerId = null;
        this.currentDelay = 0;
        this.maxDelay = this.maxDelay || 0; // in case it was not set in props
    }
}