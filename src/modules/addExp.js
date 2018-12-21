module.exports = amount => function addExp(response) {
    const { exp } = response;

    if (exp) {
        response.exp = exp + amount;
    } else {
        response.exp = amount;
    }

    return response;
};
