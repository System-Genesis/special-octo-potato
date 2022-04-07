// type HierarchyOpts = {
//   separator: string
// }

// const defaultOpts: HierarchyOpts = {
//   separator: '/',
// };

// export class Hierarchy {
//   private _separator: string;
//   private h_splitted: string[];

//   private constructor(value: string, opts: HierarchyOpts) {
//     this._separator = opts.separator;
//     this.h_splitted = value === '' ? []
//       : value.split(this._separator);
//   }

//   public concat(hierarchy: Hierarchy | string): Hierarchy {
//     if (hierarchy instanceof Hierarchy) {
//       this.h_splitted.push(...hierarchy.h_splitted);
//     } else {
//       this.h_splitted.push(...Hierarchy.create(hierarchy).h_splitted);
//     }
//     return this;
//   }

//   public value() {
//     return this.h_splitted.join(this._separator);
//   }

//   public static create(value: string, opts = defaultOpts) {
//     return new Hierarchy(value, opts);
//   }
// }
