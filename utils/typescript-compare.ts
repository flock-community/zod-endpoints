import {
  If,
  Not,
  And,
  Or,
} from "./typescript-logic.ts";

export type Extends<A, B> = Or<
  Any<B>,
  If<Any<A>, Any<B>, prv.Extends<A, B>>
>;

export type Compare<
  A,
  B,
  Options extends Compare.Options = Compare.Options.Default,
> = If<
  Extends<A, B>,
  If<
    Extends<B, A>,
    Options["equal" | "broaderRight" | "broaderLeft"],
    Options["broaderRight"]
  >,
  If<Extends<B, A>, Options["broaderLeft"], Options["mismatch"]>
>;

export namespace Compare {
  export type Strict<
    A,
    B,
    Options extends Compare.Options = Compare.Options.Default,
  > = If<
    Extends<A, B>,
    If<Extends<B, A>, Options["equal"], Options["broaderRight"]>,
    If<Extends<B, A>, Options["broaderLeft"], Options["mismatch"]>
  >;

  export interface Options {
    broaderLeft: any;
    broaderRight: any;
    equal: any;
    mismatch: any;
  }

  export namespace Options {
    export interface Default extends Compare.Options {
      broaderLeft: "broaderLeft";
      broaderRight: "broaderRight";
      equal: "equal";
      mismatch: "mismatch";
    }
  }
}

export type Equal<A, B> = Or<
  And<Any<A>, Any<B>>,
  And<
    And<NotAny<A>, NotAny<B>>,
    And<Extends<A, B>, Extends<B, A>>
  >
>;

export type NotEqual<A, B> = Not<Equal<A, B>>;

export type Any<Type> = And<
  prv.Extends<Type, 0>,
  prv.Extends<Type, 1>
>;

export type NotAny<Type> = Not<Any<Type>>;

namespace prv {
  export type Extends<A, B> = [A] extends [B] ? true : false;
}
