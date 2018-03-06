## Pintrest API clone on Apollo GraphQL with MongoDB

<img src="https://caveofcode.com/wp-content/uploads/2016/10/apollostack-300x300.png" />

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
npm install


# create docker containers for development
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d
```

### GraphQL example calls

Mutations: 
```graphql

# Create user in DB

mutation {
    createUser(username: "unique",
    password: "pass123", 
    first_name: "Marc", 
    last_name: "Marcovski")
}

# Authentication

mutation {
    loginUser(username: "unique",
    password: "pass123")
}

# Create Board

mutation { 
    createBoard(
    name: "Unique Name", 
    description: "Board description") {
        _id name created_at
        creator { username first_name }
    }
}

# Create Pin

mutation {
    createPin(board: "{boardID}",
    name: "Unique name",
    note: "Note for this pin") {
        name created_at 
        board {  created_at description name}
        creator { username first_name }
    }
}

# Follow user

mutation {
    followUser(_id: "{{userID}}") {
        username
        first_name
    }
}
```

Queries:

```graphql

# Get all Pins associated with a specific Board

{
    getPinsFromBoard(board: "{{boardID}}") {
        name
        note
    }
}

```

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
