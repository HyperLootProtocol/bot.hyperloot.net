// const command=require('./command');
// const key=require()

// const key = async function( response, {input, i18n}){
//     response.output = i18n( 'reaction_&{key}');

//     return response;
// };

// module.exports = [command('reaction_&{key}'), reactions];

const command = require('./command');
const {key} = response;

const reactions = async function(response, { username, input, i18n }) {
    if (input[0] !== {key}) {
        response.output= [command('errReactions', errReactions)];
        return response;
    }
    else {
        response.output = [command('reactions_${key}', reactions)];
        return response;
    };
};
module.exports = reactions;