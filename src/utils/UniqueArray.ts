interface Comperable {
    equals(other: any): boolean;
}

const onlyUnique = (v: Comperable, index: number, self: Comperable[]) => {
    let first_index = -1;
    for (let i = 0; i < self.length; i++) {
        if (self[i].equals(v)) {
            first_index = i;
            break;
        }
    }
    return first_index === index;
};

export class UniqueArray<T extends Comperable> {
    private constructor(private arr: T[]) {}

    static fromArray<T extends Comperable>(arr: T[]) {
        return new UniqueArray<T>(arr.filter(onlyUnique));
    }

    toArray() {
        return [...this.arr];
    }
}
