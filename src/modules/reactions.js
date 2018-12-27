let inputRct = '!someshit';

const reaction = (inputFunc) => {
  const err = 'Someshit at ur reaction!';
  if (!inputFunc.startsWith('!')) {
    return;
  }
  else if(inputFunc[1] === ' ') {
    return err;
  }
  return inputFunc;
}
reaction(inputRct);