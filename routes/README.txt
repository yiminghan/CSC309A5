Form Headers for post request:
POST /books/ :  /* Create a book if the book is not in the posting */
	bookTitle  subject  ISBN  ownerName  postingName  authors  price  description(optional)
POST /books/edit/:id :
     	title course /* These two is required if admin is using it to edit book entries */
	comment rating postingID heading /* These two is required if user is using it to rate the book */

