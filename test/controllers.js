const chai = require("chai");
const chatHttp = require('chai-http');
const cheerio = require("cheerio");
const server = require('../app').server
// assertion style "should", "expect" "assert"
const expect = chai.expect;
chai.should();
chai.use(chatHttp)


describe('Controller Tests', ()=>{

        /*
     * Test the GET routes
     */
        describe("GET login route: /dahsboard/login ", function () {
            this.timeout(5000);

            it("Test should pass if response status is 200 and login page renders", (done)=>{
                chai.request(server)
                .get("/dashboard/login")
                .end((err, res)=>{
                    if (err) return done(err);
                    res.should.have.status(200)
                    res.text.should.contain("Login")
                    expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
                done();
                });
            });

            it("Test should successfully fail if route is not found ", (done) => {
                chai.request(server)
                .get("/Login-Route")
                .end((err, res)=>{
                    if (err) return done(err);
                    res.should.have.status(404)
                    res.text.should.contain("Cannot GET /Login-Route")
                done();
                });
            });
        }) 
        
        
    /**
     * TEST POST login
     */

    describe("POST /login", function () {
        this.timeout(5000);
    
        it("Test should successfully log user in and redirect to /", (done)=>{

            chai.request(server)
            .get("/dashboard/login")
            .end((err, res)=>{
                if (err) return done(err)
                // parse the res body with cheerio
                const res_text = cheerio.load(res.text)
                // select the csrf token input 
                const csrf_token_input = res_text('input[type="hidden"][name="_csrf"]')
                // extract csrf token
                const csrfToken = csrf_token_input.val();
                // check if it's the same with the one in the header

                chai.request(server)
                .post("/dashboard/login")
                .set('cookie', res.headers['set-cookie'])
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({ email: "tipstar3@gmail.com", password: "Copycat1234@", _csrf: csrfToken})
                .end((err, res)=>{
                    if (err) return done(err)
                    res.should.have.status(200)
                    res.text.should.contain('Dashboard')
                done();
                })// end

            })// end

        }) // it

    }) // describe
})