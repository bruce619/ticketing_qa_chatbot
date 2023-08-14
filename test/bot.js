const chai = require("chai");

// assertion style "should", "expect" "assert"
const expect = chai.expect;
const assert = chai.assert;
chai.should();

const { getResponse } = require("../models/chatbot_model/chatbot")



describe("Testing Chatbot", () =>{

    it("Test should pass if intent is noanswer", function (done) {
        this.timeout(5000);
        const expectedIntent = "noanswer";
        const question = "";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });

      it("Test should pass if intent is greeting", function (done) {
        this.timeout(5000);
        const expectedIntent = "greeting";
        const question = "Hello";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });


      it("Test should pass if intent is payment_issue", function (done) {
        this.timeout(5000);
        const expectedIntent = "payment_issue";
        const question = "I am having payment issues";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });


      it("Test should pass if intent is special", function (done) {
        this.timeout(5000);
        const expectedIntent = "special";
        const question = "Do you have any specials";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });


      it("Test should pass if intent is chatbot", function (done) {
        this.timeout(5000);
        const expectedIntent = "chatbot";
        const question = "Tell me about yourself";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });


      it("Test should pass if intent is company_about", function (done) {
        this.timeout(5000);
        const expectedIntent = "company_about";
        const question = "Tell me about the company";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });

      it("Test should pass if intent is items", function (done) {
        this.timeout(5000);
        const expectedIntent = "items";
        const question = "What kind of products do you sell";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });

      it("Test should pass if intent is cancel_order", function (done) {
        this.timeout(5000);
        const expectedIntent = "cancel_order";
        const question = "I am trying to cancel my order";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });


      it("Test should pass if intent is cleaning_chemicals", function (done) {
        this.timeout(5000);
        const expectedIntent = "cleaning_chemicals";
        const question = "what kind of cleaning chemicals do you have";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });


      it("Test should pass if intent is get_invoice", function (done) {
        this.timeout(5000);
        const expectedIntent = "get_invoice";
        const question = "How do I get an invoice for my order";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });


      it("Test should pass if intent is goodbye", function (done) {
        this.timeout(5000);
        const expectedIntent = "goodbye";
        const question = "bye";
      
        getResponse(question)
          .then(({ responseTag }) => {
            console.log(responseTag);
            assert.equal(responseTag, expectedIntent);
            done(); // Call done() to signal the test completion
          })
          .catch((error) => {
            done(error); // Call done with an error if something goes wrong
          });
      });
   

})
