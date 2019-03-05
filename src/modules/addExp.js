module.exports = amount => function addExp(request) {
    const { exp } = request;

    if (exp) {
        request.exp = exp + amount;
    } else {
        request.exp = amount;
    }

    return request;
};
