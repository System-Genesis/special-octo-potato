export const wait = async (time: number) => {
    await new Promise((r) => setTimeout(r, time));
};
