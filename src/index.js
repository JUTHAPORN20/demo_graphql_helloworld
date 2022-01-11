const { GraphQLServer, PubSub } = require('graphql-yoga');

let defaultName = "Chi";
let defaultPetType = "Dog";
let defaultPetName = "GiGi"

const pubsub = new PubSub();

const typeDefs = `
	type Query {
		hello(name: String): String!
		sayhi: String!
		displayMyPet(type: String, name: String): String!
	}

	type Mutation {
		changeDefaultName(name: String!): String!
		changeDefaulPetName(name: String!): String!
	}

	type Subscription {
		updateName: String!
	}
`;

const resolvers = {
	Query: {
		hello: (root, { name }, ctx, info) => {
			if (!name)
				name = defaultName;
			return `Hello World from ${name}!`;
		},
		sayhi: () => "Hi API from graphQL",
		displayMyPet: (root, { type,  name}, ctx, info) => {
			if (!type) type = defaultPetType;
			if (!name) name = defaultPetName;
			return `My ${type} name is ${name}`;
		}
	},
	Mutation: {
		changeDefaultName: (root, { name }, ctx, info) => {
			defaultName = name;
			pubsub.publish('update_name', {
				updateName: `Notify Update Default Name to ${name}`
			})
			return `Ok change the default name to ${defaultName}`;
		},
		changeDefaulPetName: (root, { name }, ctx, info) => {
			defaultPetName = name
			return `Ok change the default name to ${defaultPetName}`;
		}
	},
	Subscription: {
		updateName: {
			subscribe(root, args, ctx, info) {
				return pubsub.asyncIterator('update_name');
			}
		}
	}
};

const server = new GraphQLServer({
	typeDefs,
	resolvers
});

const options = {
	port: 4000,
	endpoint: '/graphql'
};

server.start(options, (args) => { 
	const { port } = args;
  console.log(`Server start on port: ${port}`)
});