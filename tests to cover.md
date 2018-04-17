### implemented:
#### Pin
###### Mutation
- createPin
- updatePin
- deletePin
###### Query
- getPin
- getUserPins
#### User
###### Mutation
- createUser
- loginUser
###### Query
- getUser

#### Board
###### Mutation
- createBoard
- deleteBoard
###### Query
- getBoard

### Left to implement
#### Pin
###### Query
- searchPins (not yet implemented)
- getPinsFromBoard

#### Board
###### Mutation
- followBoard
- updateBoard
- stopFollowingBoard
###### Query
- getUserBoards
- searchBoard ***(not yet implemented)***
- getBoardSuggestion ***(not yet implemented)***
- getBoardFollowing

#### User
###### Mutation
- followUser
- stopFollowingUser
###### Query
- getAllUsers
- getUserFollowers
- getUserFollowings
