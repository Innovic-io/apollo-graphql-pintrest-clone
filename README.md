## Pintrest API clone on Apollo GraphQL with MongoDB

<img height="100" src="https://seeklogo.com/images/T/typescript-logo-B29A3F462D-seeklogo.com.png" /><img src="https://blog.savoirfairelinux.com/fr-ca/wp-content/uploads/2017/10/VQLBJ0TR_200x200.png" height="100" /><img height="100" src="https://seeklogo.com/images/A/apollo-logo-DC7DD3C444-seeklogo.com.png" /><img height="100" src="https://logos-download.com/wp-content/uploads/2016/09/Docker_logo_small.png" /><img height="100" src="https://www.ikoula.com/sites/default/files/images/mongodb_ico.png" />

*Built with:*

- TypeScript
- MongoDB
- Docker
- GraphQL

*Libraries:* 

- Apollo server ( on express )
- GraphQL ( with tools )
- JsonWebToken

*Principles:*

- Feature based code organization
- e2e testing
- unit testing
- *Custom JWT authentication* with hashed passwords stored in DB.

### Development

We used Insomnia tool for testing GraphQL API responses: https://insomnia.rest/

```bash
# install local dependencies
npm install


# create docker containers for development
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d
```

### Run e2e tests and unit tests

```bash
# end to end tests
npm run e2e

# unit tests
npm run test

```

### GraphQL example calls

Mutations: 
```graphql

# Create user in DB

mutation {
    createUser(username: "unique", password: "pass123", 
        first_name: "Marc", last_name: "Marcovski")
    
  # Authentication
    loginUser(username: "unique",
      password: "pass123")
} # copy token which you get in Bearer authorization

# create user for later follow 
mutation {
    createUser(username: "unique 1", password: "pass123", 
               first_name: "Boris", last_name: "Yurinov")
}
# Create Board

mutation { 
    createBoard(
    name: "Unique Name", 
    description: "Board description") {
        _id name created_at creator { username first_name }
    }
} # copy _id which you get

# Create Pin

mutation {
    createPin(board: "boardID",
    name: "Unique name",
    note: "Note for this pin") {
        name created_at  board {  created_at description name}
        creator { username first_name }
    }
}

# get all users 
{
	getAllUsers { _id first_name last_name }
} # copy some _id

# Follow user and Board

mutation {
	followBoard(_id: "boardID") {
		_id name followers { first_name last_name }
	}

	followUser(_id: "userID") {
		first_name last_name following { first_name last_name }
	}
} 
```

Queries:

```graphql

# Get 

fragment userResult on User { username first_name last_name }

fragment boardResult on Board { 
  name 
  creator { ...userResult } 
  followers {...userResult} }

fragment pinResult on Pin {
	name created_at note
	board { ...boardResult }
	creator { ...userResult }
}

{
	getPin(_id: "pinID") { ...pinResult }
	getBoard(_id: "boardID") { ...boardResult }
	getUser { ...userResult }
	getUserBoards { ...boardResult }
	getUserPins { ...pinResult }
	getPinsFromBoard(boardID: "boardID" ) { ...pinResult }
	getUserFollowings { ...userResult	}
}

```

# Subscription
To reflect subscription: 
1. Send one of requests
```graphql
	getAllPins {
		name
	}

	getAllUsers {
		username
	}
```
2. Go to [localhost](http://localhost:5555/)
3. Click only button there is.
### Production

```bash
docker-compose up -d
```

### Commercial break

<table style="border: 0">
  <tr>
    <td><img width="200" src="http://www.innovic.io/assets/logo-small.png" /></td>
    <td>
      <ul>
        <li>INNOVIC doo</li>
        <li>Software consulting company for building full stack solutions.</li>
        <li>Proficient in: NodeJS, TypeScript, Angular, MongoDB...</li>
        <li><b>You have project for us? hello@innovic.io</b></li>
      </ul>
    </td>
  </tr>
</table>
