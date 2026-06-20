// Bridge - Device & Remote

class Device {
    private name: string;
    protected enabled: boolean;
    protected volume: number;

    constructor(deviceName: string) {
        this.name = deviceName;
        this.enabled = false;
        this.volume = 40
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public enable(): void {
        this.enabled = true;
        console.log(`Turning ${this.name} on`);
    }

    public disable(): void {
        this.enabled = false;
        console.log(`Turning ${this.name} off`);
    }

    public getVolume(): number {
        return this.volume;
    }

    public setVolume(vol: number): void {
        if (vol >= 0 && vol <= 100) {
            this.volume = vol;
            console.log(`${this.name} volume set to ${vol}`);
        }
    }
}

class TV extends Device { };
class Radio extends Device { };

class RemoteControl {
    protected device: Device;

    constructor(device: Device) {
        this.device = device;
    }

    public togglePower(): void {
        if (this.device.isEnabled()) {
            this.device.disable();
        } else {
            this.device.enable();
        }
    }

    volumeUp() {
        this.device.setVolume(this.device.getVolume() + 10);
    }

    volumeDown() {
        this.device.setVolume(this.device.getVolume() - 10);
    }
}

class AdvanceRemoteControl extends RemoteControl {
    public mute(): void {
        this.device.setVolume(0);
    }
}

// ---- Client Code -----
const tv = new TV('TV');
const tvRemote = new RemoteControl(tv);
tvRemote.togglePower();
tvRemote.volumeDown();
tvRemote.volumeDown();

const radio = new Radio('Radio');
const radioRemote = new AdvanceRemoteControl(radio);
radioRemote.togglePower();
radioRemote.mute();