package com.redhat.services.ae.controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Random;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
//import org.bson.types.ObjectId;
import org.jboss.resteasy.annotations.jaxrs.PathParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.type.TypeReference;
import com.redhat.services.ae.Database;
import com.redhat.services.ae.Utils;
import com.redhat.services.ae.model.Survey;
import com.redhat.services.ae.utils.Json;

//import io.quarkus.mongodb.panache.PanacheMongoEntity;
//import io.quarkus.mongodb.panache.PanacheMongoEntityBase;

@Path("/api/surveys")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SurveyController{
	public static final Logger log=LoggerFactory.getLogger(SurveyController.class);
	
	
	/** #### SURVEY HANDLERS ####  */
	
	@GET
	public Response list(){
		return Response.ok(Survey.findAll()).build();
	}
	@GET
	@Path("/{surveyId}")
	public Response get(@PathParam("surveyId") String surveyId){
		return Response.ok(Survey.findById(surveyId)).build();
	}
	@POST
	public Response create(String payload) throws IOException{
		Survey o=Json.toObject(payload, Survey.class);
		if (StringUtils.isBlank(o.id)) o.id=Utils.generateId();
		if (Database.get().getSurveys().containsKey(o.id))
			throw new RuntimeException("Survey ID already exists");
		o.persist();
		return Response.ok(Survey.findById(o.id)).build();
	}
	@PUT
	@Path("/{surveyId}")
	public Response update(@PathParam("surveyId") String surveyId, String payload) throws IOException{
		System.out.println("PUT detected - payload = "+payload);
		Survey o=Json.toObject(payload, Survey.class);
		Survey entity=Survey.findById(surveyId);
		if (null==entity) throw new WebApplicationException("Unable to find "+Survey.class.getSimpleName()+" with id "+surveyId);
		entity=Survey.builder().populate(o, entity);
		entity.update();
		return Response.ok(entity).build();
	}
	@DELETE
	@Path("/{id}")
	public Response deleteSingle(@PathParam String id) throws IOException{
		Survey entity=Survey.findById(id);
		if (null==entity) throw new WebApplicationException("Unable to find "+Survey.class.getClass().getSimpleName()+" with id "+id);
		entity.delete();
		return Response.status(204).build();
	}
	@DELETE
	public Response deleteMany(String ids) throws IOException{
		System.out.println("ids="+ids);
		List<String> l=Json.newObjectMapper(true).readValue(ids, new TypeReference<List<String>>(){});
		for (String id:l)
			deleteSingle(id);
		return Response.status(204).build();
	}
	
	
	/** #### QUESTION HANDERS #### */
	
	@PUT
	@Path("/{surveyId}/questions")
	public Response saveQuestions(@PathParam("surveyId") String surveyId, String questionsJson) throws FileNotFoundException, IOException{
		Survey survey=Survey.findById(surveyId);
		survey.setQuestions(questionsJson);
		survey.update();
		return Response.ok(Survey.findById(surveyId).getQuestions()).build();
	}
	
	@GET
	@Path("/{surveyId}/questions")
	public Response getQuestions(@PathParam("surveyId") String surveyId/*, @QueryParam("questionsOnly") String questionsOnlyP, @QueryParam("responseContentType") String responseContentTypeP*/) throws FileNotFoundException, IOException{
		
		String surveyName=surveyId+".json";
//		String responseContentType=(responseContentTypeP!=null?responseContentTypeP:"application/json");
//		boolean questionsOnly="true".equalsIgnoreCase(questionsOnlyP);
		
		System.out.println("Loading questions: "+surveyName);
//		String surveyToInsert=IOUtils.toString(new File("target/classes", surveyName).exists()?new FileInputStream(new File("target/classes", surveyName).getAbsolutePath()):getClass().getClassLoader().getResourceAsStream(surveyName));
//		String questionsJson=new Questions().load(surveyName);
		
//		String result;
//		if (questionsOnly){
//			result=questionsJson;
//		}else{
//			String templateName="survey-template.js";
//			String template=IOUtils.toString(new File("target/classes", templateName).exists()?new FileInputStream(new File("target/classes", templateName).getAbsolutePath()):getClass().getClassLoader().getResourceAsStream(templateName));
//			result=template.toString();
//			int i=result.indexOf("SURVEY_CONTENT");
//			if (i>=0){
//				result=new StringBuffer(result).delete(i, i+"SURVEY_CONTENT".length()).toString();
//				result=new StringBuffer(result).insert(i, questionsJson).toString();
//			}
//		}
		
		return Response.ok(Survey.findById(surveyId).getQuestions()).build();
	}
}
