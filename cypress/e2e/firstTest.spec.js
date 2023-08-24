/// <reference types="cypress" />
//will work with this networking tab over here in the dev tools. Here will see all the requests which our web browser is making to the back end.

describe('Test with backend', () => {
    beforeEach('login to the app', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/tags', { fixture: 'tags.json' }) //when our application will make a call to text list,we want to provide a certain response. //Cyprus used this object as a replacement for the actual response of the API.
        cy.loginToApplication()
    })
    // it('should log in', () => {
    //     cy.log('logged in!')
    // })

    //OPTION - This is kind of testing the connection
    //POST -> Payload =>  Json object with the information which we just entered in our browser title is the first article. Description is nothing and body of the text is this one and what we are getting the response back.
    // GET => request about existing articles and the response with the current article we just created.
    //    => we got the comments we have over here and the response is the empty object because we don't have anything over here.


    // Verification of the Browser API Calls
    //  in this lesson we will learn how to intercept the browser API calls and how to make assertions and validations of what browser is sending to the backend server and what we are receiving back from the back end server.

    //will do a validation, that article that we created from the UI that our API actually made a request to create this article.
    //And the response came exactly as this article that we just created.

    it('verify correct request and response', () => {

        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles') // this allias 'as' is needed for us to work with the instance of this intercept later on.(is as a listener.)
        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('title of the article')
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the article')
        cy.contains('Publish Article').click()


        //So now we want to intercept this API call that browser performs when we click on the publish article
        //button and we want to get the information, what browser is sending in, what it is getting back.
        //to intercept the calls used method called cy.intercept. Need to put this method above the scenario that we are about to execute.
        //When you want to perform the certain interception of the API calls, you need to define the condition
        //that you want to intercept before the actual action that browser going to make.
        //If we put the intercept after the step, Cypress will not intercept anything because the API call will be sent first and then we declare the Hey, I want to intercept this call.
        // the sequence of the commands should be this use first The define what you want to intercept, then you perform the action and then you make a validation.
        //with cy.intercept, we need to define the configuration of what we want to intercept.
        // first parameter inside of intercept it will be the method that our API going to do, a POST call
        // The second parameter will be actually the URL that we want to intercept.
        //cy.intercept('POST', 'https://api.realworld.io/api/articles/') this is a configuration for our intercepted listener and .as('postArticles') is the variable global variable which save all this configuration and this variable going to be used to later get access to all the information that we need
        //So we configure the interception, then we make a call and after that we can access this variable with the all needed information that we want just to make sure that this response will not be empty.

        cy.wait('@postArticles').then(xhr => { // Cypress automatically will wait for this API call to be completed before we start looking into this
            // we post articles and then we take this response and then processing this response accordingly.
            console.log(xhr)
            // now we can make assertions of this object 
            // first thing we want to validate that the status code was 200.
            //validate that the body text that we send to our server was actually the one that we typed into the input field in our application.
            // we type expect and then we provide path to the place where this text is located in the request
            //validate that description, which is coming back in the response body
            expect(xhr.response.statusCode).to.equal(201)
            expect(xhr.request.body.article.body).to.equal('This is a body of the article')
            expect(xhr.response.body.article.description).to.equal('This is a description')

        })

        //     In this lesson, we automated the flow of creating of the new article through the user interface, and
        //     we created the site intercept to intercept the call that will be made by our application after we click
        //     on the Create Article button.This listener we created and saved as a post article lies.
        //     Then after we make it click, we wait for this call to be completed and assert in this air object that
        //     has all the information related to performed API calls, which has a response, which has a request object
        //     And this request and response object has full information about the body, what we sent, what we got
        //     back, and we can access this information and we can make assertion of this information.

    })


    //39. Mocking API Response

    //we will learn how to mark API calls or stub API calls using Cypress or in other words, how to intercept API request and provide our own API response that we want for our application so Cyprushow to intercept API request and provide our own API response that we want for our application so Cypress can perfectly do it with the method cy.intercept.
    // hat is important about intercepting the calls and providing the response that we need to declare intercept before our application?
    //Make this API call so we know that the tags is the very first thing that which are loaded when we open the application and logging in.
    //in our example for this intercept to be working, we need to declare it before we log it into the application
    //we want to say something like this Hey Cypress, when our application will make a call to text list,we want to provide a certain response.

    it.only('verify popular tags are displayed', () => {
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing')
            .and('contain', 'test')
        //So this values were used instead of the real response that was provided by a server.

    })
    it('verify global feed likes count', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', { "articles": [], "articlesCount": 0 })
        //* means so any values that go after the feed would count it as a match for Cyprus Intercept to react on this API and intercept this particular API call.
        cy.intercept('GET', 'https://api.realworld.io/api/articles*', { fixture: "articles.json" })

        cy.contains('Global Feed').click()
        cy.get('app-article-list button').then(heartList => {
            expect(heartList[0]).to.contain('1')
            expect(heartList[1]).to.contain('5')
        })
        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            file.articles[1].favoritesCount = 6
            cy.intercept('POST', 'https://api.realworld.io/api/articles/' + articleLink + '/favorite', file)
        })

        cy.get('app-article-list button').eq(1).click().should('contain', '6')

        //we learned, how can you provide a mock response or your own response to the API for the certain endpoint using methods CI intercept.
        // inside the intercept, you can provide a third parameter to the method intercept with your fixture object and  this object will represent the data that you want to use as a response.
        //Replacing the response from the API. The best way where you store your objects is the fixture folder, so you just provide a fixture and the name of the file.
        //If you want to modify fixture files and to do with them whatever you want, you use a cy.fixture method. Then you use this file as a normal JSON file with the typical JavaScript syntax.
        //Then we made it click and then we validated the articles count was increased
        //intercepting method, intercepting URL and in the router handler or the static response we use, probably static response, we used a fixture to provide the response for the intercepted URL, but cy.intercept also have a concept of router matcher and router handler
        //Router matcher is the object that you can very flexibly configure what kind of URL or different parameters you would like to intercept. it is very flexible configuration for the match pattern of the URL that you want to intercept.
        // router handler can give you a more flexibility and what to do with the response, how to handle the response that is intercepted by Cypress.
        //You can not only just provide the static response, you can take the response, you can process this response, modify it before the sending to the server, intercepting it and modifying before receiving back from the server.

    })

    it.only('delete a new article in a global feed', () => {

        // const userCredentials = {
        //     "user": {
        //         "email": "artem.bondar16@gmail.com", //make a simple request to the API.
        //         "password": "CypressTest1"
        //     }
        // }

        //create one more constant and we will assign our body to this constant.

        const bodyRequest = {
            "article": {
                "title": " request from API with cypress3",
                "description": "API testing",
                "body": "Angular is cool",
                "tagList": ['test']
            }
        }

        // cy.request('POST', 'https://api.realworld.io/api/users/login', userCredentials).its('body') .then(body => { //this first request will make request with our user cred
        cy.get('@token').then(token => {

            // we are getting back response , this response will have body and then We want to take this body and do something with it //We will get the property with a name body, and then we will use body user token and save our token as a variable for the next request.
            //create another variable token and we will call our body. Then we will take user and token.
            // const token = body.user.token
            //make the second request, which is supposed to request to create a new article.
            //we will have to pass headers this time. 
            cy.request({

                url: 'https://api.realworld.io/api/articles',
                headers: { 'Authorization': 'Token ' + token }, //provide object and then inside of this object, specify the parameters I need to pass in
                method: 'POST',
                body: bodyRequest
            }).then(response => { //get the response
                expect(response.status).to.equal(201)
            })
            cy.contains('Global Feed').click()
            cy.wait(500)
            cy.get(".article-preview").first().click()
            cy.get('.article-actions').contains( 'Delete Article').click()


            cy.request({
                url: 'https://api.realworld.io/api/articles',
                headers: { 'Authorization': 'Token ' + token }, //provide object and then inside of this object, specify the parameters I need to pass in
                method: "GET"
            }).its('body').then(body => {
                expect(body.articles[0].title).not.to.equal('request from API with cypress3')
            })
        })

        //using API request, you can make the API calls to any API and point to perform the same operations which our browser is doing.
    })
    // the simple configuration is parameters like method type post your URL and the body of your request
    // But the more complicated way is when you provide the object as a parameter.
    // For this cy.request an inside of this object you provide all necessary parameters for your request.
    // We have made two API requests that here and we grab the access token from the first request to use this token in this second request.
    //  we perform the UI actions and we did another API request to get the articles and verified that our article was deleted.
})