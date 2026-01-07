export type SignupCredentials = {
  email: string;
  password: string;
};

export type RegisterWithPasswordInput = SignupCredentials & {
  finalizeProfile: () => Promise<string>;
  emailRedirectTo?: string;
};

export type RegisterWithPasswordResult =
  | {
      status: "needs-confirmation";
    }
  | {
      status: "signed-in";
      slug: string;
    };
