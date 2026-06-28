// Facade - Home Theater System;

// --- Subsystems ---
class Amplifier {
    public on(): void {
        console.log("Amplifier on");
    }

    public off(): void {
        console.log("Amplifier off");
    }

    public setVolume(level: number): void {
        console.log(`Amplifier volume set to ${level}`);
    }
}

class DVDPlayer {
    public on(): void {
        console.log("DVD Player on");
    }

    public off(): void {
        console.log("DVD Player off");
    }

    public play(movie: string): void {
        console.log(`Playing "${movie}"`);
    }

    public stop(): void {
        console.log("Stopping DVD");
    }
}

class Projector {
    public on(): void {
        console.log("Projector on");
    }

    public off(): void {
        console.log("Projector off");
    }

    public wideScreenMode(): void {
        console.log("Projector in widescreen mode");
    }
}

class Lights {
    public dim(level: number): void {
        console.log(`Dimming lights to ${level}`);
    }

    public on(): void {
        console.log("Lights on");
    }
}


class HomeTheaterFacade {
    private amplifier: Amplifier;
    private dvdPlayer: DVDPlayer;
    private projector: Projector;
    private lights: Lights;

    constructor(amplifier?: Amplifier, dvdPlayer?: DVDPlayer, projector?: Projector, lights?: Lights) {
        this.amplifier = amplifier ?? new Amplifier();
        this.dvdPlayer = dvdPlayer ?? new DVDPlayer();
        this.projector = projector ?? new Projector();
        this.lights = lights ?? new Lights();
    }

    public watchMovie(movieName: string) {
        this.lights.dim(10);
        this.projector.on();
        this.projector.wideScreenMode();
        this.amplifier.on();
        this.amplifier.setVolume(50);
        this.dvdPlayer.on();
        this.dvdPlayer.play(movieName);
    }

    public endMovie() {
        this.dvdPlayer.stop();
        this.dvdPlayer.off();
        this.amplifier.off();
        this.projector.off();
        this.lights.on();
    }
}

const homeTheatre = new HomeTheaterFacade();
homeTheatre.watchMovie("Inception");
// ----- Movie Ends -------
console.log('\n----- Movie Ends -------\n')
homeTheatre.endMovie();