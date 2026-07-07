const catchAsync = (fn) => {
    return async (c, next) => {
        try {
            return await fn(c, next);
        }
        catch (err) {
            throw err;
        }
    };
};
export default catchAsync;
