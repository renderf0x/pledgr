/* DONATIONS: handle stripe transfers with this module */

//load ENV
require('dotenv').load()
//db 
var charityUser = require('../charityUser/charityUserModel');
var Donation = require('./donationModel.js');
//initialize stripe node module, passing in our secret from env
var stripe = require("stripe")(process.env.SECRET_KEY);
//q for promises
var Q = require('q');

//promisify function for Charity Search
var findCharityUser = Q.nbind(charityUser.findOne, charityUser);


module.exports = {
	transferToCharity: function(req, res){

		var donor_id = req.body.donor_id;
		var charity_id = req.body.charity_id;
		var amount = req.body.amount;
		var description = req.body.description;

		//TODO - find donorID when implemented
		
		findCharityUser({ '_id': charity_id }).then(function(charity){
			if (!charity){
				//error
				res.status(404).json({error:'no charity found'});
			} else {
				stripe.transfers.create({
					amount: amount,
					currency: "usd", //hardcoded for now
					recipient: charity.recipient_id,
					bank_account: charity.bank_account,
					statement_description: description
				}, function(err, transfer){
					//response
					var record = new Donation({
						donor_id: donor_id,
						charity_id: charity_id,
						amount: amount,
						date: transfer.date,
						status: transfer.status,
						stripe_transfer_object: transfer
					});

					record.save(function(err,data){
						if (err)
							res.send(err);
						res.status(201).json({status: transfer.status})
					});

				});
			}
		});
	},

	statsForCharity: function(req, res){
		var charity_id = req.params.charityId;

		var testData = {
			past12months: [13000,34000,24000,40000,60343,46783,57384,47585,67564,56485,69903,81007],
			allTimeTotal: 34000000
		}

		res.status(200).json(testData);
	},

	globalStats: function(req, res){
		var testData = {
			past12months: [130000,340000,240000,400000,603430,467830,573840,475850,675640,564850,699030,810070],
			allTimeTotal: 34000000000
		};

		// // Load Chance
		// var Chance = require('chance');

		// // Instantiate Chance so it can be used
		// var chance = new Chance();

		// for(var i=0; i<2000; i++) {
		// 	var randomAmount = Math.ceil(Math.random()*34000000);
		// 	testData.zips[chance.zip()] = randomAmount;
		// }

		res.status(200).json(testData);
	}
}