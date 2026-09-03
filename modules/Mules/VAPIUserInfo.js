import axios from 'axios';

const veracrossConnection =()=>{
    
    const getHeaders=(thisToken)=>{
        return  {Authorization: `Bearer ${thisToken}`, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json'}
    }

    const getOptions = (thisToken)=>{
        return {
            // method: 'GET',
            headers: {
                Authorization: `Bearer ${thisToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json'
            }
        }
    }

    const getVeraUserInfo = async (thisToken)=>{
        console.log('thisToken in request',thisToken)
        const startTime=new Date();
        const theseOptions=getOptions(thisToken);

        try {
            // axios.request(theseOptions).then((resp)=>{
            axios.get('https://accounts.veracross.com/iolani/oauth/userinfo', theseOptions).then((resp)=>{
                // console.log('thisToken in request',thisToken)
                return resp.data;
            })
            .then(async (data)=>{
                const diffDate=(((new Date())-startTime)/1000);
                data.diff=diffDate;

                const diffDate2=(((new Date())-startTime)/1000);
                console.log('thisData',data)

                return data;
            })
        } catch (error) {
        console.log('Error')

        return error
        }
    }   

    const getVeraUserInfoSync = async (thisToken)=>{
        console.log('thisToken in request',thisToken)
        const theseOptions=getOptions(thisToken);

        try {
            const thisUser = await  axios.get('https://accounts.veracross.com/iolani/oauth/userinfo', theseOptions)
           
            return {data:thisUser.data,isVeracross:(thisUser.request.res.responseUrl==='https://accounts.veracross.com/iolani/oauth/userinfo')};
        } catch (error) {

        console.log('Error')

        return error
        }
    }   

    return {getVeraUserInfo,getVeraUserInfoSync}
}

export default veracrossConnection