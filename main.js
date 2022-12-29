import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import mongoose from "mongoose";

const genId = () => Math.random().toString(32).slice(2);

const example = {
  [genId()]: {
    likes: ["1", "1"],
  },
};

const UserSchema = new mongoose.Schema({
  name: {
    type:String,
    required:true,
    
  },
  lastname: {
    type:String,
    required:true,
  },
  username: {
    type:String,
    required:true,
    
  },
  password: {
    type:String,
    required:true,
  },
})

const UserModel = mongoose.model('Users-likes',UserSchema,'users_')

const typeDefs = `
  type Token {
    id:ID
    name: String!
    lastname: String!
    username: String
  }

  input InputToken {
    id:ID
    name: String!
    lastname: String!
    username: String
  }
  
  type User {
    name: String
    lastname: String
  }
  type UserCredentials{
    username:String
    password:String
  }

  type Like {
    url:String,
  }

  input RegisterUserInput {
    name: String!
    lastname: String!
    username: String
    password: String
  }

  input LoginInput {
    username: String
    password: String
  }
  input PassChangeInput{
    username: String
    password: String
    newpass: String
  }

  type Query {
    getLikes(token:InputToken):[Like]
  }

  type Mutation {
    register(user:RegisterUserInput!):Token!
    login(credentials:LoginInput):Token!
    createLike(url:String, user:InputToken):Like!
    changeUserPass (changeData:PassChangeInput):UserCredentials!
  }
`;



const db = {
  users: [],
};

const resolvers = {
  Query: {
    getLikes(_, { token }) {
      const foundUser = db.users.find(
        (userOfUsers) => userOfUsers.id === token.id
      );
      if (!foundUser) throw new Error("Usuario no encontrado");
      return foundUser.likes;
    },
  },
  Mutation: {
    register(_, { user }) {
      const newUser = {
        ...user,
        id: genId(),
        likes: [],
      };

      db.users.push(newUser);
      return newUser;
    },
    createLike(_, { url, user }) {
      const foundUser = db.users.find(
        (userOfUsers) => userOfUsers.id === user.id
      );
      if (!foundUser) throw new Error("Usuario no encontrado");
      foundUser.likes.push({ url });
      return { url };
    },
    login(_, { credentials }) {
      const foundUser = db.users.find(
        (user) => user.username === credentials.username
      );
      if (!foundUser) throw new Error("Usuario no encontrado");
      if (foundUser.password != credentials.password)
        throw new Error("Contrasena incorrecta");

      return foundUser;
    },
    changeUserPass(_,{changeData}){
      const foundUser= db.users.find(
        (user)=>user.username===changeData.username
      )
      if (!foundUser) throw new Error("Usuario no encontrado");
      if (foundUser.password != changeData.password)
        throw new Error("Contrasena incorrecta");
      foundUser.password=changeData.newpass
      return foundUser;
    }
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = startStandaloneServer(server, {
  listen: {
    port: 8080,
  },
});

console.log(url);

