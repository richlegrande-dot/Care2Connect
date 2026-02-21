declare namespace NodeJS {
  interface Process {
    exit(code?: number): never;
  }
}
